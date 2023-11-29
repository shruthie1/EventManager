import * as express from 'express'
import { Express } from 'express'
import { Server } from 'http'
import * as compress from 'compression'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'

import { noCache } from './middlewares/NoCacheMiddleware'
import { CatEndpoints } from './cats/CatEndpoints'
import { RequestServices } from './types/CustomRequest'
import { addServicesToRequest } from './middlewares/ServiceDependenciesMiddleware'
import { Environment } from './Environment'

/**
 * Abstraction around the raw Express.js server and Nodes' HTTP server.
 * Defines HTTP request mappings, basic as well as request-mapping-specific
 * middleware chains for application logic, config and everything else.
 */
export class ExpressServer {
    private server?: Express
    private httpServer?: Server

    constructor(private catEndpoints: CatEndpoints, private requestServices: RequestServices) { }

    public async setup(port: number) {
        const server = express()
        this.setupStandardMiddlewares(server)
        this.setupServiceDependencies(server)
        this.configureEjsTemplates(server)
        this.configureApiEndpoints(server)

        this.httpServer = this.listen(server, port)
        this.server = server
        return this.server
    }

    public listen(server: Express, port: number) {
        console.info(`Starting server on port ${port}`)
        return server.listen(port)
    }

    public kill() {
        if (this.httpServer) this.httpServer.close()
    }

    private setupStandardMiddlewares(server: Express) {
        server.use(bodyParser.json())
        server.use(cookieParser())
        server.use(compress())

        const baseRateLimitingOptions = {
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 1000,
            message: 'Our API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate'
        }
        server.use('/api/', RateLimit.default(baseRateLimitingOptions))
    }

    private configureEjsTemplates(server: Express) {
        server.set('views', ['resources/views'])
        server.set('view engine', 'ejs')
    }

    private setupServiceDependencies(server: Express) {
        const servicesMiddleware = addServicesToRequest(this.requestServices)
        server.use(servicesMiddleware)
    }

    private configureStaticAssets(server: Express) {
        if (Environment.isProd()) {
            server.use([/(.*)\.js\.map$/, '/'], express.static('www/'))
        } else {
            server.use('/', express.static('www/'))
        }

        server.use('/', express.static('resources/img/'))
    }

    private configureApiEndpoints(server: Express) {
        const strictRateLimit = RateLimit.default({
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 200,
            message: 'This endpoint has a stricter rate limiting of a maximum of 200 requests per 15 minutes window, please lower your request rate'
        })

        server.get('/api/cat', noCache, this.catEndpoints.getAllCats)
        server.get('/api/statistics/cat', noCache, strictRateLimit, this.catEndpoints.getCatsStatistics)
        server.get('/api/cat/:catId', noCache, this.catEndpoints.getCatDetails)
    }
}

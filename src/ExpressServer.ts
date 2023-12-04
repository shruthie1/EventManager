import * as express from 'express'
import { Express, json, urlencoded } from 'express'
import { Server } from 'http'
import * as compress from 'compression'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'
import eventRoutes from './events/events.routes'
import ClientRoutes from './clients/clients.routes'

export class ExpressServer {
    private server?: Express
    private httpServer?: Server
    constructor() { }

    public async setup(port: number) {
        const server = express()
        this.setupStandardMiddlewares(server)
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
        server.set('trust proxy', 1);
        server.use(bodyParser.json())
        server.use(cookieParser())
        server.use(compress())
        server.use(json());
        server.use(urlencoded({ extended: true }));

        const baseRateLimitingOptions = {
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 1000,
            message: 'Our API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate'
        }
        server.use('/', RateLimit.default(baseRateLimitingOptions))
    }

    private configureApiEndpoints(server: Express) {
        server.get('/',(_req, res)=>(res.send({data:"AllGood"})) )
        server.use('/events', new eventRoutes().router)
        server.use('/cleints', new ClientRoutes().router)
    }
}

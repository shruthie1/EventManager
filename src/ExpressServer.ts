import * as express from 'express'
import { Express, json, urlencoded } from 'express'
import { Server } from 'http'
import * as compress from 'compression'
// import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'
import { noCache } from './middlewares/NoCacheMiddleware'
import eventRoutes from './events/events.routes'

export class ExpressServer {
    private server?: Express
    private httpServer?: Server
    constructor() {}

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
        // server.use(bodyParser.json())
        server.use(cookieParser())
        server.use(compress())
        server.use(json());
        server.use(urlencoded({ extended: true }));
        server.use('/events', new eventRoutes().router)

        const baseRateLimitingOptions = {
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 1000,
            message: 'Our API is rate limited to a maximum of 1000 requests per 15 minutes, please lower your request rate'
        }
        server.use('/api/', RateLimit.default(baseRateLimitingOptions))
    }

    private configureApiEndpoints(server: Express) {
        const strictRateLimit = RateLimit.default({
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 200,
            message: 'This endpoint has a stricter rate limiting of a maximum of 200 requests per 15 minutes window, please lower your request rate'
        })

        // server.post('/api/events', noCache, async (req: express.Request, res: express.Response, next: express.NextFunction) => { res.send(await this.eventsService.scheduleEvent(req.body)) })
        // server.get('/api/events', noCache, strictRateLimit, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //     const result = await this.eventsService.getEvents({})
        //     res.json(result)
        // })
        // server.get('/api/cat/:catId', noCache, this.catEndpoints.getCatDetails)
    }
}

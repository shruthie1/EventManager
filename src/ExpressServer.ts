import * as express from 'express'
import { Express, json, urlencoded } from 'express'
import { Server } from 'http'
import * as compress from 'compression'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'
import eventRoutes from './events/events.routes'
import ClientRoutes from './clients/clients.routes'
import * as fs from 'fs'
import * as path from 'path'
import * as cors from 'cors'
import { fetchWithTimeout } from './fetchWithTimeout'
import { notifbot } from './logbots'

const playbackPositions = new Map();

export class ExpressServer {
    private server?: Express
    private httpServer?: Server
    private lastActivityTime: number = Date.now()
    private inactivityInterval?: NodeJS.Timeout

    constructor() { }

    public async setup(port: number) {
        const server = express()
        this.setupStandardMiddlewares(server)
        this.configureApiEndpoints(server)
        this.setupInactivityWatcher()

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
        if (this.inactivityInterval) clearInterval(this.inactivityInterval)
    }

    private setupStandardMiddlewares(server: Express) {
        server.set('trust proxy', 1)
        server.use(bodyParser.json())
        server.use(cors())
        server.use(cookieParser())
        server.use(compress())
        server.use(json())
        server.use(urlencoded({ extended: true }))

        const baseRateLimitingOptions = {
            windowMs: 15 * 60 * 1000, // 15 min
            max: 1000,
            message: 'API limited to 1000 requests per 15 minutes'
        }
        server.use('/', RateLimit.default(baseRateLimitingOptions))

        // Update activity time for any incoming request
        server.use((req, _res, next) => {
            next()
        })
    }

    private configureApiEndpoints(server: Express) {
        server.get('/', (_req, res) => res.send({ data: "AllGood" }))

        server.get('/exit', async (_req, res) => {
            res.send({ message: "Exiting process manually" })
            await fetchWithTimeout(`${notifbot()}&text=EventManager exiting process manually!`);
            process.exit(1)
        })

        server.use('/events', new eventRoutes().router)
        server.use('/clients', new ClientRoutes().router)

        server.get('/video', (req, res) => {
            try {
                let vid = req.query.video || 1
                const chatId = req.query.chatId
                if (playbackPositions.has(chatId)) {
                    if ((playbackPositions.get(chatId) + (3 * 60 * 1000)) > Date.now() && vid == '2') {
                        vid = "3"
                    }
                }

                const filePath = path.join(__dirname, `video${vid}.mp4`)
                if (!fs.existsSync(filePath)) {
                    console.error(`Video file not found: ${filePath}`)
                    return res.status(404).send({ error: "Video not found" })
                }

                playbackPositions.set(chatId, Date.now())
                const stat = fs.statSync(filePath)
                const fileSize = stat.size

                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                }

                res.writeHead(200, head)
                fs.createReadStream(filePath).pipe(res)
            } catch (error) {
                console.error('Error serving video:', error)
                if (!res.headersSent) {
                    res.status(500).send({ error: "Failed to stream video" })
                }
            }
        })
    }

    private setupInactivityWatcher() {
        const TEN_MINUTES = 10 * 60 * 1000

        this.inactivityInterval = setInterval(async () => {
            const timeSinceLastActivity = Date.now() - this.lastActivityTime
            if (timeSinceLastActivity > TEN_MINUTES) {
                console.warn(`No requests in the last 10 minutes. Exiting process...`)
                await fetchWithTimeout(`${notifbot()}&text=EventManager exiting due to inactivity!`);
                process.exit(0)
            }
        }, 60 * 1000) // check every minute
    }
}

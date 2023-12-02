import { ExpressServer } from './ExpressServer'
import { Environment } from './Environment'
import MongoDB from './mongodb'

export class Application {
    public static async createApplication() {
        this.connectToDb().then(async (mongoClient) => {
            console.log("here");
            const expressServer = new ExpressServer()
            await expressServer.setup(Environment.getPort())
            Application.handleExit(expressServer)
            return expressServer
        }).catch(e => console.log(e))
    }

    private static async connectToDb() {
        const mongoClient = MongoDB.getInstance();
        return await mongoClient.connect();
    }
    private static handleExit(express: ExpressServer) {
        process.on('uncaughtException', (err: Error) => {
            console.error('Uncaught exception', err)
            Application.shutdownProperly(1, express)
        })
        process.on('unhandledRejection', (reason: {} | null | undefined) => {
            console.error('Unhandled Rejection at promise', reason)
            Application.shutdownProperly(2, express)
        })
        process.on('SIGINT', () => {
            console.info('Caught SIGINT')
            Application.shutdownProperly(128 + 2, express)
        })
        process.on('SIGTERM', () => {
            console.info('Caught SIGTERM')
            Application.shutdownProperly(128 + 2, express)
        })
        process.on('exit', () => {
            console.info('Exiting')
        })
    }

    private static shutdownProperly(exitCode: number, express: ExpressServer) {
        Promise.resolve()
            .then(() => express.kill())
            .then(() => {
                MongoDB.getInstance().client.close(true);
                console.info('Shutdown complete')
                process.exit(exitCode)
            })
            .catch(err => {
                console.error('Error during shutdown', err)
                process.exit(1)
            })
    }
}

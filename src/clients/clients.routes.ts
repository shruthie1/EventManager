import * as express from 'express';
import ClientController from './clients.controller';
import { noCache } from '../middlewares/NoCacheMiddleware'
import * as RateLimit from 'express-rate-limit'

class ClientRoutes {
    public router: express.Router;
    private eventController: ClientController;

    constructor() {
        console.log("initing client Routes");
        this.router = express.Router();
        this.eventController = new ClientController();
        this.initRoutes();
    }

    private initRoutes(): void {
        const strictRateLimit = RateLimit.default({
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 200,
            message: 'This endpoint has a stricter rate limiting of a maximum of 200 requests per 15 minutes window, please lower your request rate'
        })

        this.router.post('/', noCache, strictRateLimit, this.eventController.createClient);
        this.router.post('/createMultiple', noCache, strictRateLimit, this.eventController.createMultiple);
        this.router.get('/', noCache, strictRateLimit, this.eventController.getAllClients);
        this.router.get('/:id', noCache, strictRateLimit, this.eventController.getClientById);
    }
}

export default ClientRoutes;

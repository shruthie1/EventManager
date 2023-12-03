import * as express from 'express';
import EventController from './events.controller';
import { noCache } from '../middlewares/NoCacheMiddleware'
import * as RateLimit from 'express-rate-limit'

class EventRoutes {
    public router: express.Router;
    private eventController: EventController;

    constructor() {
        console.log("initing events Routes");
        this.router = express.Router();
        this.eventController = new EventController();
        this.initRoutes();
    }

    private initRoutes(): void {
        const strictRateLimit = RateLimit.default({
            windowMs: 15 * 60 * 1000, // 15 min in ms
            max: 200,
            message: 'This endpoint has a stricter rate limiting of a maximum of 200 requests per 15 minutes window, please lower your request rate'
        })

        this.router.post('/', noCache, strictRateLimit, (req, res, next) => this.eventController.createEvent(req, res, next));
        this.router.post('/schedule', (req, res, next) => this.eventController.schedulePaidEvents(req, res, next));
        this.router.post('/createMultiple', noCache, strictRateLimit, (req, res, next) => this.eventController.createMultiple(req, res, next));
        this.router.get('/', noCache, strictRateLimit, (req, res, next) => this.eventController.getAllEvents(req, res, next));
        this.router.get('/:id', noCache, strictRateLimit, (req, res, next) => this.eventController.getEventById(req, res, next));
    }
}

export default EventRoutes;

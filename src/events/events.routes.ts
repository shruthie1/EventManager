import * as express from 'express';
import EventController from './events.controller';

class EventRoutes {
    public router: express.Router;
    private eventController: EventController;

    constructor() {
        console.log("initing events Routes");
        this.router = express.Router();
        this.initRoutes();
        this.eventController = new EventController();
    }

    private initRoutes(): void {
        this.router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const result = await this.eventController.getAllEvents()
            res.send({ data: result });
        });
        this.router.post('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const result = await this.eventController.createEvent(req.body)
            res.send({ data: result });
        });
    }
}

export default EventRoutes;

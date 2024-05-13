// EventController.js
import MongoDB from '../mongodb';
import EventService from './events.service'; // Adjust the path as needed
import * as express from 'express';

export default class EventController {
    private eventService: EventService;
    constructor() {
        const mongoClient = MongoDB.getInstance().client
        this.eventService = EventService.getInstance(mongoClient);
    }

    async getAllEvents(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.getEvents(req.query);
        res.send({ data: events });
    }

    async createEvent(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.create(req.body);
        res.send({ data: events });
    }

    async schedulePaidEvents(req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log("creating Request for ", req.body.chatId, req.body.profile,req.body.type)
        const events = await this.eventService.schedulePaidEvents(<string>req.body.chatId, <string>req.body.profile, <string>req.body.type);
        res.send({ data: events });
    }

    async createMultiple(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.createMultiple(req.body);
        res.send({ data: events });
    }

    async deleteMultiple(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.query.chatId !== undefined) {
            const chatId: string = req.query.chatId as string;
            await this.eventService.deleteMultiple(chatId);
        }
        res.send(201);
    }

    async getEventById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.getEventById(req.params.id);
        res.send({ data: events });
    }
}
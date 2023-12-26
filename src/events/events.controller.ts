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
        console.log("creating Request for ", req.body.chatId, req.body.profile)
        const events = await this.eventService.schedulePaidEvents(<string>req.body.chatId, <string>req.body.profile);
        res.send({ data: events });
    }

    async createMultiple(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.createMultiple(req.body);
        res.send({ data: events });
    }

    async deleteMultiple(req: express.Request, res: express.Response, next: express.NextFunction) {
        await this.eventService.deleteMultiple(req.query.chatId);
        res.send(201);
    }

    async getEventById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.getEventById(req.params.id);
        res.send({ data: events });
    }
}
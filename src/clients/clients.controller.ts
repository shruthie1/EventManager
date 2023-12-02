// ClientController.js
import MongoDB from '../mongodb';
import ClientService from './clients.service'; // Adjust the path as needed
import * as express from 'express';

export default class ClientController {
    private eventService: ClientService;
    constructor() {
        const mongoClient = MongoDB.getInstance().client
        this.eventService = ClientService.getInstance(mongoClient);
    }

    async getAllClients(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.getClients(req.query);
        res.send({ data: events });
    }

    async createClient(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.create(req.body);
        res.send({ data: events });
    }

    async createMultiple(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.createMultiple(req.body);
        res.send({ data: events });
    }

    async getClientById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const events = await this.eventService.getClientById(req.params.id);
        res.send({ data: events });
    }
}
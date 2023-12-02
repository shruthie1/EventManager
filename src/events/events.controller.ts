// EventController.js
import MongoDB from '../mongodb';
import EventService, { MyEvent } from './events.service'; // Adjust the path as needed

export default class EventController {
    private eventService: EventService;
    constructor() {
        const mongoClient = MongoDB.getInstance().client
        this.eventService = new EventService(mongoClient);
    }

    async getAllEvents() {
        const events = await this.eventService.getEvents({});
        return events
    }

    async createEvent(data: MyEvent) {
        const events = await this.eventService.create(data);
        return events
    }

    async getEventById(id: string) {
        const eventId = id;

        // try {
        //   // Call a method from the service to get an event by ID
        //   const event = await this.eventService.getEventById(eventId);

        //   if (!event) {
        //     res.status(404).json({ error: 'Event not found' });
        //     return;
        //   }

        //   res.json(event);
        // } catch (error) {
        //   console.error(`Error fetching event with ID ${eventId}:`, error);
        //   res.status(500).json({ error: 'Internal Server Error' });
        // }
    }
}
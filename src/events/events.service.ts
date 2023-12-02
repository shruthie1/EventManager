import { MongoClient, Document, ObjectId, Collection, WithId } from 'mongodb';
import ClientsService from '../clients/clients.service';
import { fetchWithTimeout } from '../utils';

export interface MyEvent {
    _id?: ObjectId;
    chatId: string;
    time: number;
    type: 'call' | 'message';
    profile: string;
    payload: any;
}

interface EventDoc extends MyEvent, Document { }

export default class EventsService {
    private collectionName: string = 'events';
    private collection: Collection
    private clientsService: ClientsService;
    static instance: EventsService;

    private constructor(mongoClient: MongoClient) {
        this.collection = mongoClient.db('tgclients').collection(this.collectionName);
        this.startEventExecution()
        this.clientsService = ClientsService.getInstance(mongoClient);
    }

    public static getInstance(mongoClient: MongoClient): EventsService {
        if (!EventsService.instance) {
            EventsService.instance = new EventsService(mongoClient);
        }
        return EventsService.instance;
    }
    public async create(event: MyEvent) {
        try {
            const result = await this.collection.insertOne(event)
            console.log(` ${event.profile.toUpperCase()}: Event '${event.type}' scheduled for ${event.time}`);
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async createMultiple(events: MyEvent[]) {
        try {
            events.map(async event => {
                await this.create({ ...event });
            });
        } catch (error) {
            console.error('Error saving events in service:', error);
            throw error;
        }
    }

    public async getEvents(filter: {}) {
        try {
            const result = await this.collection.find(filter).toArray();
            console.log(result)
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async getEventById(id: string) {
        try {
            const result = await this.collection.findOne({ _id: new ObjectId(id) });
            console.log(result)
            return result;
        } catch (error) {
            throw error;
        }
    }

    public startEventExecution() {
        console.log("Started Event Execution");
        setInterval(async () => {
            const currentTime = Date.now();

            try {
                const events: WithId<EventDoc>[] = <WithId<EventDoc>[]>(await this.collection.find({ time: { $lte: currentTime } }).toArray())
                console.log("Found Events:", events.length)
                events.forEach(async (event: EventDoc) => {
                    console.log(`Executing event '${event.name}' at ${currentTime}`);
                    const profile = await this.clientsService.getClientById(event.profile);
                    if (event.type === 'call') {
                        await fetchWithTimeout(`https://${profile.url}/requestCall/${event.chatId}`)
                    } else if (event.type === 'message') {
                        // Execute message event logic and access message content
                        console.log(`Sending message: ${event.payload.message}`);
                    }
                    try {
                        await this.collection.deleteOne({ _id: event._id });
                        console.log(`Event '${event.name}' removed from the database`);
                    } catch (error) {
                        throw error;
                    }
                })
            } catch (error) {
                throw error;
            }
        }, 5000);
    }
}

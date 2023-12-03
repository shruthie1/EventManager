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

    public async schedulePaidEvents(chatId: string, profile: string) {
        const events: MyEvent[] = [
            { type: 'call', chatId, time: Date.now() + (2 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (5 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (10 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (15 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (30 * 60 * 1000), payload: {}, profile },
            { type: 'message', chatId, time: Date.now() + (6 * 60 * 1000), payload: { message: "Some Network issue...!!\n\nDont worry, I will not cheat U!!\nI will try again Wait...!!" }, profile },
            { type: 'message', chatId, time: Date.now() + (16 * 60 * 1000), payload: { message: "Some Problem, Call Not connecting now...!!\n\nI will give u service today pakka!!\n\nPlease Understand and Beleive me Baby!!" }, profile }
        ]
        try {
            events.map(async event => {
                await this.create({ ...event });
            });
        } catch (error) {
            console.error('Error saving events in service:', error);
            throw error;
        }
        return ({ message: `schedule events for ${profile} | Chatid: ${chatId}` })
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
                if (events.length > 0) console.log("Found Events:", events.length)
                events.forEach(async (event: EventDoc) => {
                    console.log(`Executing event '${event.name}' at ${currentTime}`);
                    const profile = await this.clientsService.getClientById(event.profile);
                    if (event.type === 'call') {
                        await fetchWithTimeout(`${profile.url}requestCall/${event.chatId}`)
                    } else if (event.type === 'message') {
                        await fetchWithTimeout(`${profile.url}sendMessage/${event.chatId}?msg=${encodeURIComponent(event.payload.message)}`);
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
        }, 60000);
    }
}

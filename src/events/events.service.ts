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
    private pingerCount = 0;

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
            if (event.profile && event.chatId && event.type) {
                const result = await this.collection.insertOne(event)
                console.log(` ${event.profile.toUpperCase()}: Event '${event.type}' scheduled for ${event.time}`);
                return result;
            } else {
                console.log("Bad event format")
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async deleteMultiple(chatId: string) {
        try {
            await this.collection.deleteMany({ chatId })
        } catch (error) {
            console.log(error);
        }
    }

    public async createMultiple(events: MyEvent[]) {
        try {
            events.map(async event => {
                await this.create({ ...event });
            });
        } catch (error) {
            console.error('Error saving events in service:', error);
            console.log(error);
        }
    }

    public async schedulePaidEvents(chatId: string, profile: string) {
        const events: MyEvent[] = [
            { type: 'call', chatId, time: Date.now() + (1.5 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (3 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (5 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (12 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (15 * 60 * 1000), payload: {}, profile },
            { type: 'call', chatId, time: Date.now() + (30 * 60 * 1000), payload: {}, profile },
            { type: 'message', chatId, time: Date.now() + (3.3 * 60 * 1000), payload: { message: "Network issue??\n\nCall is Failed to Connect!!" }, profile },
            { type: 'message', chatId, time: Date.now() + (5.3 * 60 * 1000), payload: { message: "Some Network issue...!!\n\nDont worry, I will not cheat U!!\nI will try again Wait sometime...!!" }, profile },
            { type: 'message', chatId, time: Date.now() + (6 * 60 * 1000), payload: { message: `Heyy You Call me Here👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n\nU Call me Now!!` }, profile },
            // { type: 'message', chatId, time: Date.now() + (6 * 60 * 1000), payload: { message: "Dont Speak Okay!!\nI'm in **Bathroom\nMute yourself**!! I will Show you in Call Okay..!!" }, profile },
            { type: 'message', chatId, time: Date.now() + (8 * 60 * 1000), payload: { message: `You Call me Here Man!!\nU Call Now!!, It will work!!\n\nOpen👇👇\nhttps://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
            { type: 'message', chatId, time: Date.now() + (9 * 60 * 1000), payload: { message: `https://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
            { type: 'message', chatId, time: Date.now() + (13 * 60 * 1000), payload: { message: `https://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
            { type: 'message', chatId, time: Date.now() + (17 * 60 * 1000), payload: { message: `Call me Here Man!!\nU Call Now!!\n\nOpen👇👇\nhttps://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
            { type: 'message', chatId, time: Date.now() + (16 * 60 * 1000), payload: { message: "Same Problem, Call Not connecting now...!!\nPlease Understand and Beleive me Baby!!\n\nI will give u service today pakka ok!!\nPlease Wait Sometime...!!\nI will only message you okay!!" }, profile }
        ]
        try {
            events.map(async event => {
                await this.create({ ...event });
            });
        } catch (error) {
            console.error('Error saving events in service:', error);
        }
        return ({ message: `scheduled events for ${profile} | Chatid: ${chatId}` })
    }

    public async getEvents(filter: {}) {
        try {
            const result = await this.collection.find(filter).toArray();
            console.log(result)
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    public async pinger() {
        try {
            this.pingerCount++;
            if (this.pingerCount % 6 === 0) {
                await fetchWithTimeout('https://tgcms.glitch.me/')
                await fetchWithTimeout('https://arpithared.onrender.com/')
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getEventById(id: string) {
        try {
            const result = await this.collection.findOne({ _id: new ObjectId(id) });
            console.log(result)
            return result;
        } catch (error) {
            console.log(error);
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
                    try {
                        console.log(`Executing event '${event.type}' at ${currentTime}`);
                        const profile = await this.clientsService.getClientById(event.profile);
                        if (profile) {
                            if (event.type === 'call') {
                                const url = `${profile.repl}/requestCall/${event.chatId}`;
                                console.log(url)
                                await fetchWithTimeout(url)
                            } else if (event.type === 'message') {
                                const url = `${profile.repl}/sendMessage/${event.chatId}?msg=${encodeURIComponent(event.payload.message)}`
                                console.log(url)
                                await fetchWithTimeout(url);
                            }
                        } else {
                            console.log("Profile does not exist:", profile)
                        }
                        await this.collection.deleteOne({ _id: event._id });
                        console.log(`Event '${event._id}' removed from the database`);
                    } catch (error) {
                        console.log(error);
                    }
                })
            } catch (error) {
                console.log(error);
            }
            this.pinger()
        }, 20000);
    }
}

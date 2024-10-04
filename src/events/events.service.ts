import { MongoClient, Document, ObjectId, Collection, WithId } from 'mongodb';
import ClientsService from '../clients/clients.service';
import { fetchWithTimeout, sleep } from '../utils';

export interface MyEvent {
    _id?: ObjectId;
    chatId: string;
    time: number;
    type: 'call' | 'message';
    profile: string;
    payload: any;
}

interface EventDoc extends MyEvent, Document {}

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

    public async createMultiple(events: MyEvent[]) {
        try {
            const validEvents = events.filter(event => event.profile && event.chatId && event.type);

            if (validEvents.length > 0) {
                const result = await this.collection.insertMany(validEvents);

                validEvents.forEach(event => {
                    console.log(` ${event.profile.toUpperCase()}: Event '${event.type}' scheduled for ${event.time}`);
                });

                return result;
            } else {
                console.log("No valid events to insert.");
            }
        } catch (error) {
            console.error('Error inserting events:', error);
        }
    }

    public async deleteMultiple(chatId: string) {
        try {
            await this.collection.deleteMany({ chatId })
        } catch (error) {
            console.log(error);
        }
    }

    public async schedulePaidEvents(chatId: string, profile: string, type: string = '1') {
        console.log("received req for", chatId, profile, type);
        const existingEvents = await this.getEvents({ chatId, profile });
        if (existingEvents.length > 0) {
            return ({ message: `Events already exists for ${profile} | Chatid: ${chatId}` })
        } else {
            let events: MyEvent[] = []
            if (type == '1') {
                events = [
                    { type: 'call', chatId, time: Date.now() + (1.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (2.2 * 60 * 1000), payload: { message: "Wait, I will Try Again!!" }, profile },
                    { type: 'call', chatId, time: Date.now() + (2.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (3.2 * 60 * 1000), payload: { message: "Do you have any Network issue??\n\nCall is Failed to Connect!!" }, profile },
                    { type: 'call', chatId, time: Date.now() + (3.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (4.2 * 60 * 1000), payload: { message: "Some Network issue...!!\n\nDont worry, I will not cheat U!!\nI will try again!!\nPlease Wait...!!" }, profile },
                    { type: 'message', chatId, time: Date.now() + (4.7 * 60 * 1000), payload: { message: "Dont Speak Okay!!\nI'm in **Bathroom\nMute yourself**!! I will Show you in Call Okay..!!" }, profile },
                    { type: 'message', chatId, time: Date.now() + (5 * 60 * 1000), payload: { message: `Heyy You Call me Here👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n\nU Call me Now!!` }, profile },
                    { type: 'message', chatId, time: Date.now() + (6 * 60 * 1000), payload: { message: `You Call me Here Man!!\nU Call Now!!, It will work!!\n\nOpen👇👇\nhttps://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
                    { type: 'message', chatId, time: Date.now() + (7 * 60 * 1000), payload: { message: `https://ZomCall.netlify.app/${profile}/${chatId}\n\nU Call me on the Zoom!!` }, profile },
                    { type: 'message', chatId, time: Date.now() + (8 * 60 * 1000), payload: { message: `https://ZomCall.netlify.app/${profile}/${chatId}\n\nU only Call me on the Zoom!!` }, profile },
                    { type: 'message', chatId, time: Date.now() + (11 * 60 * 1000), payload: { message: `Call me Here Man!!\nU Call Now!!\n\nOpen👇👇\nhttps://ZomCall.netlify.app/${profile}/${chatId}` }, profile },
                    { type: 'message', chatId, time: Date.now() + (13 * 60 * 1000), payload: { message: "Same Problem, Call Not connecting now...!!\n\nPlease Understand and Beleive me Baby!!\n\nI will give u service today pakka ok!!\n\nPlease Wait Sometime...!!\nI will only message you okay!!" }, profile },

                    { type: 'call', chatId, time: Date.now() + (15 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (15 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (20 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (20 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (30 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (30 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (45 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (45 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },
                ];
            } else if (type == '2') {
                events = [
                    { type: 'message', chatId, time: Date.now() + (1 * 60 * 1000), payload: { message: "Wait, I will Try Again!!" }, profile },
                    { type: 'call', chatId, time: Date.now() + (1.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (2 * 60 * 1000), payload: { message: `Seems its not working at all,\n\nYou Call me Here Only👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n\nU Call me Now!!\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (4 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (4 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (6.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (6.5 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (9 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (9 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (12 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (12 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (15 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (15 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (20 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (20 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (30 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (30 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (45 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (45 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },
                ]
            } else {
                events = [
                    { type: 'message', chatId, time: Date.now() + (1 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (4 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (4 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (6.5 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (6.5 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (9 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (9 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (12 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (12 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (15 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (15 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (20 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (20 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (30 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (30 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                    { type: 'call', chatId, time: Date.now() + (45 * 60 * 1000), payload: {}, profile },
                    { type: 'message', chatId, time: Date.now() + (45 * 60 * 1000), payload: { message: `Call me👇👇!!\nhttps://ZomCall.netlify.app/${profile}/${chatId}\n` }, profile },

                ]
            }

            await this.createMultiple(events)
            return ({ message: `scheduled events for ${profile} | Chatid: ${chatId}` })
        }
    }

    public async getEvents(filter: {}): Promise<any[]> {
        try {
            const result = await this.collection.find(filter).toArray();
            console.log(result)
            return result;
        } catch (error) {
            console.log(error);
            return []
        }
    }

    public async pinger() {
        try {
            this.pingerCount++;
            if (this.pingerCount % 13 == 1) {
                await fetchWithTimeout('https://tg-cms.onrender.com/', {}, true, 0)
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
                const events: WithId<EventDoc>[] = <WithId<EventDoc>[]>(await this.collection.find({ time: { $lte: currentTime } }).sort({ time: 1 }).toArray());
                if (events.length > 0) console.log("Found Events:", events.length);
                for (const event of events) {
                    try {
                        console.log(`Executing event '${event.type}' at ${currentTime}`);
                        const profile = await this.clientsService.getClientById(event.profile);

                        if (profile) {
                            if (event.type === 'call') {
                                const url = `${profile.repl}/requestCall/${event.chatId}`;
                                console.log(url);
                                await fetchWithTimeout(url);
                            } else if (event.type === 'message') {
                                const url = `${profile.repl}/sendMessage/${event.chatId}?msg=${encodeURIComponent(event.payload.message)}`;
                                console.log(url);
                                await fetchWithTimeout(url);
                            }
                        } else {
                            console.log("Profile does not exist:", profile);
                        }

                        await this.collection.deleteOne({ _id: event._id });
                        console.log(`Event '${event._id}' removed from the database`);
                    } catch (error) {
                        console.log(error);
                    }
                    await sleep(2000)
                }
            } catch (error) {
                console.log(error);
            }
            this.pinger();
        }, 20000);
    }

}

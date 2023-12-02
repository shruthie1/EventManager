import { MongoClient, Document, ObjectId, Collection, WithId } from 'mongodb';

export interface MyEvent {
    _id?: ObjectId;
    time: number;
    type: 'call' | 'message';
    profile: string;
    payload: any;
}

interface EventDoc extends MyEvent, Document { }

export default class EventsService {
    private collectionName: string = 'events';
    private collection: Collection
    public constructor(mongoClient: MongoClient) {
        this.collection = mongoClient.db('tgclients').collection(this.collectionName);
        this.startEventExecution()
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
                const eventToSave = {
                    time: event.time,
                    type: event.type,
                    profile: event.profile,
                    payload: event.payload,
                }
                await this.create(eventToSave);
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

                    if (event.type === 'call') {
                        // Execute call event logic
                        console.log('Calling logic goes here');
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

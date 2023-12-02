import { MongoClient, Document, ObjectId, Collection, WithId } from 'mongodb';


interface ClientDoc extends Document { }

export default class ClientsService {
    private collectionName: string = 'clients';
    private collection: Collection
    static instance: ClientsService;
    private constructor(mongoClient: MongoClient) {
        this.collection = mongoClient.db('tgclients').collection(this.collectionName);
    }

    public static getInstance(mongoClient: MongoClient): ClientsService {
        if (!ClientsService.instance) {
            ClientsService.instance = new ClientsService(mongoClient);
        }
        return ClientsService.instance;
    }
    public async create(event: any) {
        try {
            const result = await this.collection.insertOne(event)
            console.log(` ${event.profile.toUpperCase()}: Client '${event.type}' scheduled for ${event.time}`);
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async createMultiple(events: any[]) {
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

    public async getClients(filter: {}) {
        try {
            const result = await this.collection.find(filter).toArray();
            console.log(result)
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async getClientById(id: string) {
        try {
            const result = await this.collection.findOne({ clientId: id });
            console.log(result)
            if (result) {
                return result;
            } else {
                throw new Error("Not found")
            }
        } catch (error) {
            throw error;
        }
    }
}

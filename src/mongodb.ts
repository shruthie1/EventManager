import { MongoClient, Db, ServerApiVersion, ConnectOptions } from 'mongodb';

class MongoDB {
    private static instance: MongoDB;
    public client: MongoClient = new MongoClient(process.env.mongodburi as string, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1, maxPoolSize: 10 } as ConnectOptions);
    public db!: Db;
    private constructor() {
    }

    public async connect() {
        try {
            console.log('Trying to connect to DB.....');
            const client = await this.client.connect()
            console.log('Connected to MongoDB');
            this.db = client.db("tgclients");
            return client;
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
            process.exit(1);
        }
    }

    public static getInstance(): MongoDB {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance;
    }
}

export default MongoDB;

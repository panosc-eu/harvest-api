import { reject } from "bluebird";
import { MongoClient } from "mongodb";
import logger from "../../logger";

export class MongoConnector {
    public static instance: MongoConnector;
    public db;
    public dbName: string;
    public collectionName: string;

    private constructor() {
        const url = `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DATABASE}`;
//        const url = `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}`;
        this.dbName = process.env.DATABASE;
        this.collectionName = process.env.DB_COLLECTION_NAME;

        console.log(url);
        console.log(this.dbName);
        console.log(this.collectionName);

        MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
            if (err) {
                this.db = null;
                console.log(err);
            }
            this.db = client.db(this.dbName);
        });
    }

    public static getInstance(): MongoConnector {
        try {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new MongoConnector();
            return this.instance;
        } catch (err) {
            logger.error(err);
            throw new Error("Failed to get MongoConnector instance: " + err.message);
        }
    }

    /**
     * Responds to OAI GetRecord requests.
     * @param parameters
     * @returns {Promise<any>}
     */
    public getRecord(parameters: any): Promise<any> {
        if (!this.db) {
            reject("no db connection");
        }
        let Publication = this.db.collection(this.collectionName);
        return new Promise((resolve: any, reject: any) => {
            const query = {
                oaiIdentifier: parameters.oaiIdentifier
            };
            Publication.findOne(query, {}, function (err, item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(item);
                }
            });
        });
    }

    public putPublication(parameters: any): Promise<any> {
        if (!this.db) {
            reject("no db connection");
        }
        let Publication = this.db.collection(this.collectionName);
        return new Promise((resolve: any, reject: any) => {
            Publication.insertOne(parameters, {}, function (err, item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(item);
                }
            });
        });
    }

    public updatePublication(parameters: any): Promise<any> {
        if (!this.db) {
            reject("no db connection");
        }
        let Publication = this.db.collection(this.collectionName);
        return new Promise((resolve: any, reject: any) => {
            const query = {
                oaiIdentifier: parameters.oaiIdentifier
            };
            Publication.updateOne(query, { $set: parameters }, { upsert: true }, function (err, item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(item);
                }
            });
        });
    }
}
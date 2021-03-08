import logger from "../../../server/logger";
import { reject } from "bluebird";
import { MongoClient } from "mongodb";

/**
 * This is the DAO service for Scicat. It uses a mongo connection
 * to retrieve data.  Database connection parameters are
 * provided by the credentials file (path defined in .env).
 */
export class MongoConnector {
  public static instance: MongoConnector;
  public db = null;

  private constructor() {
    logger.debug("Setting up the mongo connection.");

    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        logger.error("failed to connect", err);
        this.db = null;
      }
      this.db = client.db(process.env.DB_DATABASE_NAME);
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
      throw new Error("Failed to get MongoConnector instance: " + err.message);
    }
  }

  /**
   * Responds to OAI ListRecords requests.
   * @param parameters
   * @returns {Promise<any>}
   */
  public recordsQuery(parameters: any): Promise<any> {
    if (this.db) {
      const collection = this.db.collection(process.env.DB_COLLECTION_NAME);
      return new Promise((resolve: any, reject: any) => {
        collection.find().toArray(function(err, items) {
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    } else {
      reject("no db connection");
    }
  }

  /**
   * Responds to OAI ListIdentifiers requests.
   * @param parameters
   * @returns {Promise<any>}
   */
  public identifiersQuery(parameters: any): Promise<any> {
    if (this.db) {
      const collection = this.db.collection(process.env.DB_COLLECTION_NAME);
      return new Promise((resolve: any, reject: any) => {
        // need to add relevant date to projection
        collection.find({}, { _id: 1 }).toArray(function(err, items) {
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
    } else {
      reject("no db connection");
    }
  }

  /**
   * Responds to OAI GetRecord requests.
   * @param parameters
   * @returns {Promise<any>}
   */
  public getRecord(parameters: any): Promise<any> {
    if (this.db) {
      const collection = this.db.collection(process.env.DB_COLLECTION_NAME);
      return new Promise((resolve: any, reject: any) => {
        const query = {
          _id: parameters.identifier,
        };
        collection.findOne(query, {}, function(err, item) {
          if (err) {
            reject(err);
          } else {
            resolve(item);
          }
        });
      });
    } else {
      reject("no db connection");
    }
  }

  private aggregatePublicationQuery(pipeline: any): Promise<any> {
    if (this.db) {
      const collection = this.db.collection(process.env.DB_COLLECTION_NAME);
      var resolve = null;
      return new Promise((resolve: any, err: any) => {
        var resolve = collection.aggregate(pipeline, function(err, cursor) {
          cursor.toArray(function(err, resolve) {
            if (err) {
              logger.error("recordsQuery error:", err);
            }
          });
        });
      });
    } else {
      reject("no db connection");
    }
  }
}

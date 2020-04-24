"use strict";

const mongodb = require("mongodb");
const dotenv = require("dotenv");


dotenv.config({ path: __dirname + '/.env' });

if (process.argv.length >= 4) {
    const database = process.argv[2];
    const parameters = JSON.parse(process.argv[3]);
    const url = `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${database}`;
    mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.log(err);
            process.exit(2);
        } else {
            const db = client.db(database);
            let Publication = db.collection(process.env.DB_COLLECTION_NAME);
            let params = {
                _id: parameters.oaiIdentifier,
                oaiIdentifier: parameters.oaiIdentifier,
                pid: parameters.oaiIdentifier,
                title: parameters.title,
                dataDescription: parameters.description,
                creationTime: new Date(Date.now()),
                publicationYear: parameters.publicationYear,
                creator: [parameters.creator],
                affiliation: parameters.affiliation,
                publisher: parameters.publisher
            }
            Publication.insertOne(params, {}, (err, item) => {
                if (err) {
                    console.error(err);
                    process.exit(3);
                } else {
                    console.info(item.result);
                }
                process.exit(0);
            });
        }
    });
} else {
    console.log(process.argv.length);
    console.log('Usage:\n node upload.js DATABASE_NAME PARAMETERS\n\n example: node upload.js oai-publications-02 `{"oaiIdentifier":"TEST_DATA_01", "title":"", "description":"", "publicationYear":"", "creator":"", "affiliation":"", "publisher":""}`');
    process.exit(0);
}

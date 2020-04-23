import { Request, Response } from "express";
import { CoreOaiProvider } from "../core/core-oai-provider";
import logger from "../../server/logger";
import { factory } from "../plexus-provider/repository/plexus-data-repository";
import { Configuration } from "../plexus-provider/repository/configuration";
import { PlexusDcMapper } from "../plexus-provider/repository/plexus-dc-mapper";
import { oaiRequestHandler } from "./oai-request-handler";
const MongoClient = require("mongodb").MongoClient;

/**
 * This is a CoreOaiProvider instance configured for the sample repository module.
 * Module configuration is provided via constructor parameters.
 * @type {CoreOaiProvider}
 */
export const oai = (basePath: string) => {
  return oaiRequestHandler(new CoreOaiProvider(factory, new Configuration(basePath), new PlexusDcMapper()));
}

export let publication = (req: Request, res: Response) => {

  //res.set('Content-Type', 'text/xml');
  let db = null;
  MongoClient.connect("mongodb://" + process.env.DB_HOSTNAME + ":27017", (err, client) => {
    if (err) return logger.console.error(err);
    db = client.db("aoi-publications");
    db.collection("Publication").save(req.body, (err, result) => {
      if (err) return logger.error(err);
      logger.debug("saved to database");
      res.redirect("/");
    });
  });
  
//  res.send(generateException(exception, EXCEPTION_CODES.BAD_VERB));
};

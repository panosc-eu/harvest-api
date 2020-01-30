import {CoreOaiProvider} from "../core/core-oai-provider";
import {factory} from "../plexus-provider/repository/plexus-data-repository";
import {Configuration} from "../plexus-provider/repository/configuration";
import { OpenaireMapper } from "../plexus-provider/repository/openaire-mapper";
import { oaiRequestHandler } from "./oai-request-handler";

/**
 * This is a CoreOaiProvider instance configured for the sample repository module.
 * Module configuration is provided via constructor parameters.
 * @type {CoreOaiProvider}
 */
export const oai = (basePath: string) => {
  return oaiRequestHandler(new CoreOaiProvider(factory, new Configuration(basePath), new OpenaireMapper()));
}


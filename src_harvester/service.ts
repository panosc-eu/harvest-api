import { Harvester } from './harvester/harvester';

let harvesters = process.env.OAI_PMH_SOURCES.split(',').map(url => new Harvester(url));


export default function startHarvesters() {
    for (let harvester of harvesters) {
        harvester.start();
    }
}
startHarvesters();

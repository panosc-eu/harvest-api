import './env';
import schedule = require('node-schedule');
import startHarvesters from './service';

const job = schedule.scheduleJob('0 0 * * * *', startHarvesters);

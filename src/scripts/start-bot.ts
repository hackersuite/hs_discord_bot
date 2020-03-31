import { HackathonClient } from '../bot/HackathonClient';
import { HackathonConfig } from '../bot/util/config';
import * as pino from 'pino';

const config = require('../../data/config.json') as HackathonConfig;

const logger = pino();
const loggers = {
	app: logger,
	bot: logger.child({ name: 'bot' }),
	db: logger.child({ name: 'db' }),
	twitter: logger.child({ name: 'twitter' })
};

const client = new HackathonClient({ loggers, ...config });

client.start();

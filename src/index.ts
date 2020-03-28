import { HackathonClient } from './HackathonClient';
import { loadConfig } from './util/config-loader';
import * as pino from 'pino';

const config = loadConfig();

const logger = pino();
const loggers = {
	app: logger,
	bot: logger.child({ name: 'bot' }),
	db: logger.child({ name: 'db' })
};

const client = new HackathonClient({ loggers, ...config });

client.start();

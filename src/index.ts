import { HackathonClient, ApplicationConfig } from './HackathonClient';
import pino from 'pino';
import { config as loadEnv } from 'dotenv';

loadEnv();

function getEnv(name: string) {
	const val = process.env[name];
	if (typeof val === 'undefined') {
		throw new Error(`Environment variable '${name}' is unset`);
	}
	return val;
}

const logger = pino();

const config: ApplicationConfig = {
	discord: {
		botToken: getEnv('BOT_DISCORD_TOKEN'),
		guildID: getEnv('BOT_GUILD_ID'),
		owners: getEnv('BOT_OWNERS').split(','),
		prefix: getEnv('BOT_PREFIX')
	},
	botApi: {
		url: getEnv('HS_DISCORD_API')
	},
	twitter: {
		consumerKey: getEnv('TWITTER_CONSUMER_KEY'),
		consumerSecret: getEnv('TWITTER_CONSUMER_SECRET')
	},
	loggers: {
		app: logger,
		bot: logger.child({ name: 'bot' }),
		twitter: logger.child({ name: 'twitter' })
	}
};

const client = new HackathonClient(config);

client.start();

import { Logger } from 'pino';

export interface HackathonConfig {
	discord: {
		prefix: string;
		botToken: string;
		owners: string[];
		guildID: string;
		teamsCategoryID: string;
	};
	hsAuth: {
		url: string;
		token: string;
	};
}

export interface ApplicationConfig extends HackathonConfig {
	loggers: {
		app: Logger;
		bot: Logger;
		db: Logger;
	};
}

export function loadConfig(): HackathonConfig {
	return require('../../data/config.json') as HackathonConfig;
}

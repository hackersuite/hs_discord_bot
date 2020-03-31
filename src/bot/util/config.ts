import { Logger } from 'pino';

export interface HackathonConfig {
	discord: {
		prefix: string;
		botToken: string;
		owners: string[];
		guildID: string;
	};
	hsAuth: {
		url: string;
		token: string;
	};
	twitter: {
		consumerKey: string;
		consumerSecret: string;
	};
}

export interface ApplicationConfig extends HackathonConfig {
	loggers: {
		app: Logger;
		bot: Logger;
		db: Logger;
		twitter: Logger;
	};
}

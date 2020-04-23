import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { join } from 'path';
import { Logger } from 'pino';
import MuteTracker from './util/MuteTracker';
import { Image } from 'canvas';

export interface ApplicationConfig {
	discord: {
		prefix: string;
		botToken: string;
		owners: string[];
		guildID: string;
	};
	botApi: {
		url: string;
	};
	twitter: {
		consumerKey: string;
		consumerSecret: string;
		watermark: Image;
	};
	loggers: {
		app: Logger;
		bot: Logger;
		twitter: Logger;
	};
}

export class HackathonClient extends AkairoClient {
	public readonly config: ApplicationConfig;
	public readonly muteTracker: MuteTracker;
	private readonly commandHandler: CommandHandler;


	public constructor(config: ApplicationConfig) {
		super({
			ownerID: config.discord.owners
		}, {
			partials: ['MESSAGE', 'REACTION']
		});

		this.config = config;

		this.muteTracker = new MuteTracker();

		this.on('debug', msg => this.loggers.bot.info(msg));
		this.on('error', (error: Error) => this.loggers.bot.error(error));

		this.commandHandler = new CommandHandler(this, {
			blockBots: true,
			blockClient: true,
			prefix: config.discord.prefix,
			allowMention: true,
			directory: join(__dirname, 'commands')
		});

		const listenerHandler = new ListenerHandler(this, {
			directory: join(__dirname, 'listeners')
		});
		this.commandHandler.useListenerHandler(listenerHandler);
		listenerHandler.loadAll();

		this.commandHandler.loadAll();
	}

	public get loggers() {
		return this.config.loggers;
	}

	public start() {
		return this.login(this.config.discord.botToken);
	}
}

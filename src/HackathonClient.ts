import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { ApplicationConfig } from './util/config-loader';
import { join } from 'path';
import { Connection } from 'typeorm';

export class HackathonClient extends AkairoClient {
	public readonly config: ApplicationConfig;
	private readonly commandHandler: CommandHandler;
	public databaseConnection?: Connection;

	public constructor(config: ApplicationConfig) {
		super({
			ownerID: config.discord.owners
		});

		this.config = config;

		this.on('debug', msg => this.loggers.bot.info(msg));

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

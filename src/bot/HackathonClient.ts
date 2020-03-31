import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { ApplicationConfig } from './util/config';
import { join } from 'path';
import { AuthClient } from './hs_auth/client';
import { createDBConnection } from './database';
import { Connection } from 'typeorm';

export class HackathonClient extends AkairoClient {
	public readonly config: ApplicationConfig;
	public readonly authClient: AuthClient;
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

		this.authClient = new AuthClient({
			apiBase: config.hsAuth.url,
			token: config.hsAuth.token
		});

		this.commandHandler.loadAll();
	}

	public get loggers() {
		return this.config.loggers;
	}

	public async start() {
		this.databaseConnection = await createDBConnection();
		this.loggers.bot.info('Starting bot...');
		this.login(this.config.discord.botToken);
	}
}

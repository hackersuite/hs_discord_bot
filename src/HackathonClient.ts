import { AkairoClient, CommandHandler } from 'discord-akairo';
import { ApplicationConfig } from './util/config-loader';
import { join } from 'path';

export class HackathonClient extends AkairoClient {
	private readonly config: ApplicationConfig;
	private readonly commandHandler: CommandHandler;
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

		this.commandHandler.loadAll();
	}

	public get loggers() {
		return this.config.loggers;
	}

	public start() {
		this.loggers.bot.info('Starting bot...');
		this.login(this.config.discord.botToken);
	}
}

import { AkairoClient, CommandHandler } from 'discord-akairo';
import { HackathonConfig } from './util/config-loader';
import { join } from 'path';

export class HackathonClient extends AkairoClient {
	private readonly config: HackathonConfig;
	private readonly commandHandler: CommandHandler;
	public constructor(config: HackathonConfig) {
		super({
			ownerID: config.discord.owners
		});

		this.config = config;

		this.commandHandler = new CommandHandler(this, {
			blockBots: true,
			blockClient: true,
			prefix: config.discord.prefix,
			allowMention: true,
			directory: join(__dirname, 'commands')
		});

		this.commandHandler.loadAll();
	}

	public start() {
		this.login(this.config.discord.botToken);
	}
}

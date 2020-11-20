import { AkairoClient, CommandHandler, ListenerHandler, Command } from 'discord-akairo';
import { join } from 'path';
import { Logger } from 'pino';
import MuteTracker from './util/MuteTracker';
import { Image } from 'canvas';
import { Message } from 'discord.js';
import { authClient } from './util/authClient';
import { getUser } from '@unicsmcr/hs_discord_bot_api_client';

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
	hsAuth: {
		token: string;
	};
	twitter: {
		consumerKey: string;
		consumerSecret: string;
		query: string;
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

		this.commandHandler.on('cooldown', (message: Message, command: Command, remaining: number) => {
			message
				.reply(`You can't use that command for another ${Math.ceil(remaining / 1000)} seconds.`)
				.catch(err => this.loggers.bot.warn(err));
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

	public async userHasResource(userId: string, resource: string): Promise<boolean> {
		const resources = await authClient.getAuthorizedResources(this.config.hsAuth.token, [resource], userId);
		return resources.includes(resource);
	}

	public async discordUserHasResource(discordID: string, resource: string): Promise<boolean> {
		const authUser = await getUser(discordID);
		return this.userHasResource(authUser.authId, resource);
	}

	public start() {
		return this.login(this.config.discord.botToken);
	}
}

const { AkairoClient, CommandHandler } = require('discord-akairo');
const config = require('../data/config.json');
const { appLogger, botLogger } = require('./util/logger');

appLogger.info('Starting...');

// Load required environment variables
require('./util/loadEnvironment')(config);

class Client extends AkairoClient {
	constructor() {
		super({
			ownerID: config.discord.owners
		});

		this.commandHandler = new CommandHandler(this, {
			blockBots: true,
			blockClient: true,
			prefix: config.discord.prefix,
			allowMention: true,
			directory: './src/commands/'
		});

		this.commandHandler.loadAll();
	}
}

const client = new Client();

client.on('debug', info => botLogger.info(info));

client.login(config.discord.bot_token);

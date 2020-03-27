const { AkairoClient, CommandHandler } = require('discord-akairo');
const config = require('../data/config.json');
const { appLogger, botLogger } = require('./util/logger');
const Database = require('./db/Database');

appLogger.info('Starting...');

// Load required environment variables
require('./util/loadEnvironment')(config);

class Client extends AkairoClient {
	constructor(config) {
		super({
			ownerID: config.discord.owners
		});

		this.config = config;

		this.commandHandler = new CommandHandler(this, {
			blockBots: true,
			blockClient: true,
			prefix: config.discord.prefix,
			allowMention: true,
			directory: './src/commands/'
		});

		this.commandHandler.loadAll();

		this.db = new Database();
		this.db.init()
			.then(() => this.login(config.discord.bot_token))
			.catch(this.destroy);
	}

	destroy(error) {
		appLogger.error(`Destroying application:`);
		appLogger.error(error);
		super.destroy();
		this.db.close();
	}
}

const client = new Client(config);

client.on('debug', info => botLogger.info(info));

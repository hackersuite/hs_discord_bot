const { AkairoClient, CommandHandler } = require('discord-akairo');
const config = require('../data/config.json');

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
client.login(config.discord.bot_token);

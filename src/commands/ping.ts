import { Message } from 'discord.js';
import { Command } from 'discord-akairo';

class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping']
		});
	}

	public exec(message: Message) {
		return message.reply('Pong!');
	}
}

module.exports = PingCommand;

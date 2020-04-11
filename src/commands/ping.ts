import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { getUser } from '@unicsmcr/hs_discord_bot_api_client';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping']
		});
	}

	public async exec(message: Message) {
		const user = await getUser(message.author.id);
		return message.reply(`pong! You are ${user.name}`);
	}
}

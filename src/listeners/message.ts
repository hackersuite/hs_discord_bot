import { Listener } from 'discord-akairo';
import { HackathonClient } from '../HackathonClient';
import { TextChannel, Message } from 'discord.js';
import Filter from 'bad-words';

export default class MessageListener extends Listener {
	private readonly filter: Filter;

	public constructor() {
		super('message', {
			emitter: 'client',
			event: 'message'
		});
		this.filter = new Filter();
	}

	public async exec(message: Message) {
		const client = this.client as HackathonClient;
		if (message.guild?.id !== client.config.discord.guildID) return;
		const channel = message.channel as TextChannel;
		if (this.filter.isProfane(message.content)) {
			await message.delete();
			await channel.send('profane');
		}
	}
}

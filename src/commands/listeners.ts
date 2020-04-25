import { Message, TextChannel, VoiceChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';

export default class ListenersCommand extends Command {
	public constructor() {
		super('listeners', {
			aliases: ['listeners']
		});
	}

	public async exec(message: Message) {
		const client = this.client as HackathonClient;
		const guild = this.client.guilds.cache.get(client.config.discord.guildID);
		if (!guild) return;
		const channel = guild.channels.cache.find(channel => channel.name === 'Workshop') as VoiceChannel;
		if (!channel) return;
		const members = channel.members;
		const task = new Task({
			title: 'Workshop listeners',
			issuer: message.author,
			description: members.array().map(member => member.user.tag).sort()
				.join('\n'),
			status: TaskStatus.Completed
		}).addField('Workshop viewer count', members.size);
		await task.sendTo(message.channel as TextChannel);
	}
}

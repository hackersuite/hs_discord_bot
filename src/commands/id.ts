import { Message, TextChannel, DMChannel, User } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';

export default class IdCommand extends Command {
	public constructor() {
		super('id', {
			aliases: ['id'],
			args: [
				{
					'id': 'target',
					'type': 'user',
					'default': (message: Message) => message.author
				}
			]
		});
	}

	public async exec(message: Message, args: { target: User }) {
		const task = new Task({
			title: 'User ID',
			issuer: message.author,
			description: `${args.target.tag} - your ID is ${message.author.id}`,
			status: TaskStatus.Completed
		});
		await task.sendTo(message.channel as TextChannel | DMChannel).catch(error => {
			(this.client as HackathonClient).config.loggers.bot.warn(error);
		});
	}
}

import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { resetGuild } from '../actions/resetGuild';
import { HackathonClient } from '../HackathonClient';
import { Task, TaskStatus } from '../util/task';

class ResetCommand extends Command {
	public constructor() {
		super('reset', {
			aliases: ['reset']
		});
	}

	public async exec(message: Message) {
		const client = message.client as HackathonClient;
		if (!message.guild) return;
		if (!client.ownerID.includes(message.author.id)) return;

		const task = new Task({
			title: 'Task: Reset Server',
			description: 'Working on it!',
			issuer: message.author
		});
		await task.sendTo(message.channel);

		try {
			await resetGuild({
				guild: message.guild
			});
			await task.update({
				description: 'Completed! 👍\nCheck the Audit Logs for a full overview of the changes made.',
				status: TaskStatus.Completed
			});
		} catch (error) {
			client.loggers.bot.warn('Error occurred when trying to run reset');
			client.loggers.bot.warn(error);
			await task.update({ description: 'Failed to complete, check logs for more information', status: TaskStatus.Failed });
		}
	}
}

module.exports = ResetCommand;

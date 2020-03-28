import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { setupGuild } from '../actions/setupGuild';
import { HackathonClient } from '../HackathonClient';
import { Task, TaskStatus } from '../util/task';

class SetupCommand extends Command {
	public constructor() {
		super('setup', {
			aliases: ['setup']
		});
	}

	public async exec(message: Message) {
		const client = message.client as HackathonClient;
		if (!message.guild) return;
		if (!client.ownerID.includes(message.author.id)) return;

		const task = new Task({
			title: 'Task: Setup Server',
			description: 'Working on it!',
			issuer: message.author
		});
		await task.sendTo(message.channel);

		try {
			await setupGuild({
				guild: message.guild,
				config: client.config
			});
			await task.update({
				description: 'Completed! 👍\nCheck the Audit Logs for a full overview of the changes made.',
				status: TaskStatus.Completed
			});
		} catch (error) {
			await task.update({ description: 'Failed to complete', status: TaskStatus.Failed });
		}
	}
}

module.exports = SetupCommand;

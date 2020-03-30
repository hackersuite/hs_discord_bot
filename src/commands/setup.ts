import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { setupGuild } from '../actions/setupGuild';
import { HackathonClient } from '../HackathonClient';
import { Task, TaskStatus } from '../util/task';

export default class SetupCommand extends Command {
	public constructor() {
		super('setup', {
			aliases: ['setup']
		});
	}

	public async exec(message: Message) {
		const client = message.client as HackathonClient;
		const guild = message.client.guilds.cache.get(client.config.discord.guildID);
		if (!guild || !client.ownerID.includes(message.author.id)) return;

		const task = new Task({
			title: 'Task: Setup Server',
			description: 'Working on it!',
			issuer: message.author
		});
		await task.sendTo(message.channel);

		try {
			await setupGuild({
				guild,
				config: client.config
			});
			await task.update({
				description: 'Completed! 👍\nCheck the Audit Logs for a full overview of the changes made.',
				status: TaskStatus.Completed
			});
		} catch (error) {
			client.loggers.bot.warn(`Error occurred for task ${task.id}`);
			client.loggers.bot.warn(error);
			await task.update({
				description: `Failed to complete: ${(error as Error).message}`,
				status: TaskStatus.Failed
			});
		}
	}
}

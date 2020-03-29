import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { HackathonClient } from '../HackathonClient';
import { identify } from '../actions/identify';
import { Task, TaskStatus } from '../util/task';

interface IdentifyCommandArgs {
	id: string;
}

class IdentifyCommand extends Command {
	public constructor() {
		super('identify', {
			aliases: ['identify', 'register'],
			args: [
				{
					id: 'id',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, args: IdentifyCommandArgs) {
		const client = message.client as HackathonClient;

		const task = new Task({
			title: 'Discord Registration',
			description: `We're trying to identify your account and setup permissions for your account - one sec!`,
			issuer: message.author
		});
		await task.sendTo(message.channel);

		const guild = client.guilds.cache.get(client.config.discord.guildID);
		if (!client.databaseConnection || !guild) {
			task.update({
				description: 'There was a configuration error - please inform an organiser!',
				status: TaskStatus.Failed
			});
			return;
		}

		const member = guild.members.cache.get(message.author.id);
		if (!member) {
			task.update({
				description: 'I couldn\'t find you in the StudentHack 2020 server - join it then try to reidentify!',
				status: TaskStatus.Failed
			});
			return;
		}

		try {
			const res = await identify({
				authClient: client.authClient,
				authId: args.id,
				connection: client.databaseConnection,
				member
			});
			if (res.teamNumber) {
				const channel = guild.channels.cache.find(channel => channel.name === `team-${res.teamNumber}`);
				if (!channel) return;
				await task.update({
					description: `Welcome **${res.authUser.name}!**\n\n` +
					`You can access your team's channel here ${channel}`,
					status: TaskStatus.Completed
				});
			} else {
				await task.update({
					description: `Welcome **${res.authUser.name}!**\n\nYou aren't currently in a team yet.`,
					status: TaskStatus.Completed
				});
			}
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

module.exports = IdentifyCommand;

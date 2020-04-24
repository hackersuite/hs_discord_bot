import { Message, TextChannel, DMChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';
import { getTeams, getUsers, AuthLevel } from '@unicsmcr/hs_discord_bot_api_client';
import humanizeDuration from 'humanize-duration';

export default class StatsCommand extends Command {
	public constructor() {
		super('stats', {
			aliases: ['stats']
		});
	}

	public async exec(message: Message) {
		const task = new Task({
			title: 'Server statistics',
			issuer: message.author,
			description: 'Fetching the stats now...'
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);
		const client = this.client as HackathonClient;
		const guild = client.guilds.cache.get(client.config.discord.guildID);
		if (!guild) {
			task.update({
				status: TaskStatus.Failed,
				description: 'Hackathon guild not found'
			});
			return;
		}
		try {
			task.status = TaskStatus.Completed;
			task.description = '';
			const [users, teams] = await Promise.all([getUsers(), getTeams()]);
			const participants = users.filter(user => user.authLevel === AuthLevel.Attendee).length;
			const volunteers = users.filter(user => user.authLevel === AuthLevel.Volunteer).length;
			task.addFields(
				{
					name: 'Participants in Discord server',
					value: participants
				},
				{
					name: 'Volunteers in Discord server',
					value: volunteers
				},
				{
					name: 'Teams',
					value: teams.length
				},
				{
					name: 'Uptime',
					value: client.uptime ? humanizeDuration(client.uptime) : 'Undefined'
				}
			);
			task.update({});
		} catch (error) {
			client.loggers.bot.warn(error);
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			});
		}
	}
}

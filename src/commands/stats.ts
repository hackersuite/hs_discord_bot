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
			const participants = users.filter(user => user.authLevel === AuthLevel.Attendee);
			const volunteers = users.filter(user => user.authLevel === AuthLevel.Volunteer);
			const teamMembers: Map<string, number> = new Map();
			let nonTeam = 0;
			for (const user of participants) {
				if (user.team) {
					teamMembers.set(user.team, (teamMembers.get(user.team) || 0) + 1);
				} else {
					nonTeam++;
				}
			}
			const teams4 = [...teamMembers.values()].filter(n => n >= 4).length;
			const teams3 = [...teamMembers.values()].filter(n => n === 3).length;
			const teams2 = [...teamMembers.values()].filter(n => n === 2).length;
			const teams1 = [...teamMembers.values()].filter(n => n === 1).length;
			task.addFields(
				{
					name: 'Participants in Discord server',
					value: participants.length
				},
				{
					name: 'Volunteers in Discord server',
					value: volunteers.length
				},
				{
					name: 'Teams',
					value: teams.length
				},
				{
					name: 'Users in teams of 4 (or more?)',
					value: teams4 * 4
				},
				{
					name: 'Users in teams of 3',
					value: teams3 * 3
				},
				{
					name: 'Users in teams of 2',
					value: teams2 * 2
				},
				{
					name: 'Users in teams of 1 / not in a team',
					value: teams1 + nonTeam
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

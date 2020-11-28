import { Message, TextChannel, DMChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { getUser, getTeam, APITeam, getUsers } from '@unicsmcr/hs_discord_bot_api_client';
import { HackathonClient } from '../HackathonClient';

export default class WhoIsAuthCommand extends Command {
	public constructor() {
		super('whoisauth', {
			aliases: ['whoisauth'],
			args: [
				{
					id: 'target',
					type: 'lowercase',
					prompt: {
						start: 'Who would you like to get the details of?',
						retry: 'That\'s not a valid ID! Try again.'
					}
				}
			]
		});
	}

	public async exec(message: Message, args: { target: string }) {
		const client = this.client as HackathonClient;
		const task = new Task({
			title: 'User info',
			issuer: message.author,
			description: 'Fetching the info now...'
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);
		try {
			const issuer = await getUser(message.author.id);
			if (!(await client.userCanAccessResource(issuer.authId, 'hs:hs_discord:bot:whois'))) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you do not have permission to use this command.'
				});
			}

			if (message.guild) {
				const channel = message.channel as TextChannel;
				if (channel.permissionsFor(message.guild.id)?.has('VIEW_CHANNEL')) {
					return task.update({
						status: TaskStatus.Failed,
						description: 'Sorry, you need to run this in a private channel.'
					});
				}
			}

			task.status = TaskStatus.Completed;
			task.description = '';

			const users = await getUsers();
			const user = users.find(user => user.authId === args.target);

			if (!user) {
				return task.update({
					status: TaskStatus.Failed,
					description: `User not found with auth ID ${args.target}`
				}).catch(err => client.loggers.bot.warn(err));
			}

			task.addFields(
				{
					name: 'Name',
					value: user.name
				},
				{
					name: 'Auth ID',
					value: user.authId
				}
			);
			let team: APITeam | undefined;
			if (user.team) {
				try {
					team = await getTeam(user.team);
					task.addFields(
						{
							name: 'Team Name',
							value: team.name
						},
						{
							name: 'Team Auth ID',
							value: team.authId
						},
						{
							name: 'Team Number',
							value: team.teamNumber
						}
					);
				} catch (error) {
					task.addFields({
						name: 'Team',
						value: `Auth ID: ${user.team} (error fetching more info than this)`
					});
					client.config.loggers.bot.warn(`Error fetching team ${user.team}`);
					client.config.loggers.bot.warn(error);
				}
			}
			await task.update({});
		} catch (error) {
			if (error.res?.statusCode === 404) {
				task.update({
					status: TaskStatus.Failed,
					description: `This account is not linked.`
				}).catch(err => client.loggers.bot.warn(err));
			} else {
				task.update({
					status: TaskStatus.Failed,
					description: `An error occurred processing your request. Try again later.`
				}).catch(err => client.loggers.bot.warn(err));
			}
		}
	}
}

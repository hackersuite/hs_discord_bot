import { Message, TextChannel, DMChannel, User } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { getUser, getTeam, APITeam, AuthLevel } from '@unicsmcr/hs_discord_bot_api_client';
import { HackathonClient } from '../HackathonClient';

export default class WhoIsCommand extends Command {
	public constructor() {
		super('whois', {
			aliases: ['whois'],
			args: [
				{
					id: 'target',
					type: 'user',
					prompt: {
						start: 'Who would you like to get the details of?',
						retry: 'That\'s not a valid member! Try again.'
					}
				}
			]
		});
	}

	public async exec(message: Message, args: { target: User }) {
		const client = this.client as HackathonClient;
		const task = new Task({
			title: 'User info',
			issuer: message.author,
			description: 'Fetching the info now...'
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);
		try {
			const issuer = await getUser(message.author.id);
			if (issuer.authLevel < AuthLevel.Volunteer) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you need to be a volunteer or organiser to use this command.'
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
			const user = await getUser(args.target.id);
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

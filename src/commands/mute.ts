import { Message, TextChannel, DMChannel, GuildMember } from 'discord.js';
import { Command } from 'discord-akairo';
import { modifyUserRoles, getUser, AuthLevel } from '@unicsmcr/hs_discord_bot_api_client';
import { Task, TaskStatus } from '../util/task';

export default class MuteCommand extends Command {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			args: [
				{
					id: 'target',
					type: 'member',
					prompt: {
						start: 'Who would you like to mute?',
						retry: 'That\'s not a valid member! Try again.',
						optional: true
					}
				}
			],
			channel: 'guild'
		});
	}

	public async exec(message: Message, args: { target: GuildMember }) {
		const task = new Task({
			title: 'Mute Member',
			issuer: message.author,
			description: `Muting **${args.target.user.tag}** (${args.target.id})`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		try {
			const user = await getUser(message.author.id);
			if (user.authLevel < AuthLevel.Volunteer) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you need to be a volunteer or organiser to use this command.'
				});
			}

			await modifyUserRoles(args.target.id, {
				method: 'add',
				roles: ['role.muted']
			});

			task.update({
				status: TaskStatus.Completed,
				description: `Muted **${args.target.user.tag}** (${args.target.id})`
			});
		} catch (err) {
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			});
		}
	}
}

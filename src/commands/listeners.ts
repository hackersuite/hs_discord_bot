import { Message, TextChannel, DMChannel, VoiceChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';
import { APIUser, getUsers } from '@unicsmcr/hs_discord_bot_api_client';

const COMMA_REGEX = /,/g;

function escape(text: string): string {
	return text.replace(COMMA_REGEX, '\\,');
}

export default class ListenersCommand extends Command {
	public constructor() {
		super('listeners', {
			aliases: ['listeners'],
			args: [
				{
					id: 'target',
					type: 'voiceChannel',
					prompt: {
						start: 'Which channel (provide the channel ID)?',
						retry: 'That\'s not a valid channel! Try again.'
					}
				}
			]
		});
	}

	public async exec(message: Message, args: { target: VoiceChannel }) {
		const client = message.client as HackathonClient;

		const task = new Task({
			title: 'Listeners',
			issuer: message.author,
			description: `Getting the list of users in ${args.target.name}...`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		try {
			if (!(await client.discordUserCanAccessResource(message.author.id, 'hs:hs_discord:bot:listeners'))) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you do not have permission to use this command.'
				});
			}

			const _users = await getUsers();
			const users: Record<string, APIUser> = {};
			for (const user of _users) {
				users[user.discordId] = user;
			}

			const csv = [
				'Discord ID,Auth User ID,Auth Name,Email,Discord Tag'
			];

			for (const member of args.target.members.values()) {
				if (member.user.bot) continue;
				const record = [member.id, 'none', 'none', 'none', member.user.tag];
				const authUser = users[member.user.id] as APIUser|undefined;
				if (authUser) {
					record[1] = authUser.authId;
					record[2] = authUser.name;
					record[3] = authUser.email;
				}
				csv.push(record.map(v => escape(v)).join(','));
			}

			await message.author.send('', {
				files: [
					{
						attachment: Buffer.from(csv.join('\n')),
						name: 'listeners.csv'
					}
				]
			});

			await task.update({
				status: TaskStatus.Completed,
				description: `Sent list of users in ${args.target.name}!`
			});
		} catch (err) {
			client.loggers.bot.warn(err);
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			}).catch(err => client.loggers.bot.warn(err));
		}
	}
}

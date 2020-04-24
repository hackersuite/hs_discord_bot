import { Message, TextChannel, DMChannel, User } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { syncAccount, getUser, AuthLevel } from '@unicsmcr/hs_discord_bot_api_client';

export default class SyncCommand extends Command {
	public constructor() {
		super('sync', {
			aliases: ['sync'],
			args: [
				{
					'id': 'target',
					'type': 'user',
					'default': (message: Message) => message.author
				}
			],
			// One use per minute to stop abuse of API
			cooldown: 60e3,
			ratelimit: 1
		});
	}

	public async exec(message: Message, args: { target: User }) {
		const task = new Task({
			title: 'User sync',
			issuer: message.author,
			description: `Syncing account state`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);
		try {
			let target = args.target;
			if (target.id !== message.author.id) {
				const issuer = await getUser(message.author.id);
				if (issuer.authLevel < AuthLevel.Volunteer) {
					target = message.author;
				}
			}
			await syncAccount(target.id);
			await task.update({
				status: TaskStatus.Completed,
				description: `Synced state for ${target.tag}!`
			});
		} catch (error) {
			await task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Try again later.\n\n${error.message}`
			});
		}
	}
}

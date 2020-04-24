import { Message, TextChannel, DMChannel, User } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { syncAccount } from '@unicsmcr/hs_discord_bot_api_client';

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
			]
		});
	}

	public async exec(message: Message, args: { target: User }) {
		const task = new Task({
			title: 'User sync',
			issuer: message.author,
			description: `Syncing state for ${args.target.tag}`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);
		try {
			await syncAccount(args.target.id);
			await task.update({
				status: TaskStatus.Completed,
				description: `Synced state for ${args.target.tag}!`
			});
		} catch (error) {
			await task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Try again later.\n\n${error.message}`
			});
		}
	}
}

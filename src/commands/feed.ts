import { Message, TextChannel, DMChannel, User } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';
import fetch from 'node-fetch';
import { getUser } from '@unicsmcr/hs_discord_bot_api_client';

const ACHIEVEMENT_ID: string = process.env.FEED_ACHIEVEMENT_ID!;
if (!ACHIEVEMENT_ID) {
	throw new Error('FEED_ACHIEVEMENT_ID must be set');
}

export default class FeedCommand extends Command {
	public constructor() {
		super('feed', {
			aliases: ['feed'],
			args: [
				{
					id: 'target',
					type: 'user',
					prompt: {
						start: 'Who would you like to feed?',
						retry: 'That\'s not a valid user! Try again.'
					}
				}
			]
		});
	}

	public async exec(message: Message, args: { target: User }) {
		const client = message.client as HackathonClient;
		const task = new Task({
			title: 'Feed Member 🍕',
			issuer: message.author,
			description: `Feeding **${args.target.tag}** (${args.target.id})`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		try {
			if (!(await client.discordUserCanAccessResource(message.author.id, 'hs:hs_discord:bot:feed'))) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you do not have permission to feed the participants :('
				});
			}

			const authUser = await getUser(args.target.id);

			await fetch(`https://hub.greatunihack.com/achievements/${ACHIEVEMENT_ID}/api/complete`, {
				method: 'PUT',
				body: JSON.stringify({ userId: authUser.authId }),
				headers: {
					'Authorization': client.config.hsAuth.token,
					'Content-Type': 'application/json'
				}
			});

			await task.update({
				status: TaskStatus.Completed,
				description: `Fed **${args.target.tag}** (${args.target.id})`
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

import { Message, TextChannel, DMChannel, VoiceChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';

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
			],
			channel: 'guild'
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

			if (message.guild) {
				const channel = message.channel as TextChannel;
				if (channel.permissionsFor(message.guild.id)?.has('VIEW_CHANNEL')) {
					return task.update({
						status: TaskStatus.Failed,
						description: 'Sorry, you need to run this in a private channel.'
					});
				}
			}

			const users = args.target.members.map(member => member.id);

			await task.update({
				status: TaskStatus.Completed,
				description: `Got the list of users in ${args.target.name}!`
			});

			await task.attachFiles([
				{
					attachment: Buffer.from(JSON.stringify(users)),
					name: 'listeners.csv'
				}
			]);
		} catch (err) {
			client.loggers.bot.warn(err);
			task.update({
				status: TaskStatus.Failed,
				description: `An error occurred processing your request. Please try again later.`
			}).catch(err => client.loggers.bot.warn(err));
		}
	}
}

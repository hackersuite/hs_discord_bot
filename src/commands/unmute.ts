import { Message, TextChannel, DMChannel, GuildMember, MessageEmbed } from 'discord.js';
import { Command } from 'discord-akairo';
import { modifyUserRoles } from '@unicsmcr/hs_discord_bot_api_client';
import { Task, TaskStatus } from '../util/task';
import { HackathonClient } from '../HackathonClient';

export default class MuteCommand extends Command {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			args: [
				{
					id: 'target',
					type: 'member',
					prompt: {
						start: 'Who would you like to unmute?',
						retry: 'That\'s not a valid member! Try again.'
					}
				}
			],
			channel: 'guild'
		});
	}

	public async exec(message: Message, args: { target: GuildMember }) {
		const client = message.client as HackathonClient;
		const modChannel = client.guilds.cache.get(client.config.discord.guildID)?.channels.cache
			.find(c => c.name === 'moderation') as TextChannel;
		const task = new Task({
			title: 'Unmute Member',
			issuer: message.author,
			description: `Unmuting **${args.target.user.tag}** (${args.target.id})`
		});
		await task.sendTo(message.channel as TextChannel | DMChannel);

		try {
			if (!(await client.discordUserHasResource(message.author.id, 'hs:hs_discord:bot:unmute'))) {
				return task.update({
					status: TaskStatus.Failed,
					description: 'Sorry, you do not have permission to use this command.'
				});
			}

			client.muteTracker.delete(args.target.id);

			await modifyUserRoles(args.target.id, {
				method: 'remove',
				roles: ['role.muted']
			});

			const crosspost = new MessageEmbed()
				.setAuthor(args.target.user.tag, args.target.user.displayAvatarURL())
				.setTimestamp(new Date())
				.setTitle(`Unmuted by ${message.author.tag}`)
				.setColor('#9cffab')
				.setFooter(`User ID: ${args.target.id} | Mod ID: ${message.author.id}`);

			await modChannel.send(crosspost);

			await task.update({
				status: TaskStatus.Completed,
				description: `Unmuted **${args.target.user.tag}** (${args.target.id})`
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

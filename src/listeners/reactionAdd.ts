import { Listener } from 'discord-akairo';
import { HackathonClient } from '../HackathonClient';
import { MessageReaction, User, TextChannel, MessageEmbed, Message } from 'discord.js';

export default class ReactionAddListener extends Listener {
	public constructor() {
		super('messageReactionAdd', {
			emitter: 'client',
			event: 'messageReactionAdd'
		});
	}

	public async approve(message: Message, user: User, targetChannel: TextChannel) {
		const tweetURL = message.content;
		const publicMessage = await targetChannel.send(message.content);
		const embed = new MessageEmbed()
			.setTitle('Tweet Approved')
			.setAuthor(user.tag, user.displayAvatarURL())
			.setDescription(`Approved tweet ${tweetURL}\n\n**[Jump to message](${publicMessage.url})**`)
			.setColor('#a1ff9c')
			.setTimestamp(new Date());
		await message.edit(null, embed);
		return tweetURL;
	}

	public async reject(message: Message, user: User) {
		const tweetURL = message.content;
		const embed = new MessageEmbed()
			.setTitle('Tweet Rejected')
			.setAuthor(user.tag, user.displayAvatarURL())
			.setDescription(`Rejected tweet ${tweetURL}`)
			.setColor('#ff9c9c')
			.setTimestamp(new Date());
		await message.edit(null, embed);
		return tweetURL;
	}

	public async exec(reaction: MessageReaction, user: User) {
		const client = user.client as HackathonClient;
		const logger = client.config.loggers.twitter;
		const channel = reaction.message.channel;
		const tweetURL = reaction.message.content;

		const shouldExec = channel.type === 'text' &&
			channel.guild.id === client.config.discord.guildID &&
			channel.name === 'twitter-staging' &&
			['👍', '👎'].includes(reaction.emoji.name) &&
			reaction.count === 1 &&
			reaction.message.embeds.length > 0 &&
			reaction.message.content.includes('https://twitter.com/');

		if (shouldExec) {
			const action = reaction.emoji.name === '👍' ? 'approve' : 'reject';
			try {
				const targetChannel = (channel as TextChannel).guild.channels.cache
					.find(c => c.type === 'text' && c.name === 'twitter') as TextChannel | undefined;
				if (!targetChannel) {
					throw new Error('Could not find public twitter channel!');
				}
				action === 'approve'
					? await this.approve(reaction.message, user, targetChannel)
					: await this.reject(reaction.message, user);
				logger.info(`Success: ${action} tweet ${tweetURL}`);
			} catch (err) {
				logger.warn(`Failed to ${action} tweet with message ID ${reaction.message.id}`);
				logger.warn(err);
			}
		}
	}
}

import { Listener } from 'discord-akairo';
import { HackathonClient } from '../HackathonClient';
import { TextChannel, Message, Guild, MessageEmbed } from 'discord.js';
import Filter from 'bad-words';
import { modifyUserRoles } from '@unicsmcr/hs_discord_bot_api_client';

export default class MessageListener extends Listener {
	private readonly filter: Filter;

	public constructor() {
		super('message', {
			emitter: 'client',
			event: 'message'
		});
		this.filter = new Filter();
	}

	private execProfane(message: Message) {
		const client = this.client as HackathonClient;
		const guild = message.guild as Guild;
		const modChannel = guild.channels.cache.find(c => c.name === 'moderation') as TextChannel;

		const crosspost = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setTimestamp(new Date())
			.setDescription(message.content)
			.setFooter(`User ID: ${message.author.id}`)
			.addField('Channel', message.channel);

		const promises: Promise<any>[] = [message.delete()];

		if (client.muteTracker.increment(message.author.id) > 2) {
			crosspost.setTitle('Automatic Mute').setColor('#fc0303');
			promises.push(modifyUserRoles(message.author.id, {
				method: 'add',
				roles: ['role.muted']
			}));
			promises.push(message.reply('You have been muted for repeated profanity.'));
		} else {
			crosspost.setTitle('Warning').setColor('#fc6f03');
			promises.push(message.reply('Offensive language is not allowed here! Further usage could result in a mute.'));
		}
		promises.push(modChannel.send(crosspost));
		return Promise.all(promises);
	}

	public async exec(message: Message) {
		const client = this.client as HackathonClient;
		if (message.guild?.id !== client.config.discord.guildID) return;
		const channel = message.channel as TextChannel;
		if (channel.parent && channel.parent.name.toLowerCase() !== 'hackathon') return;
		if (this.filter.isProfane(message.content)) {
			try {
				await this.execProfane(message);
			} catch (err) {
				const logger = client.config.loggers.bot;
				logger.warn(`Failed to fully process ${channel.id}/${message.id} for profanity:`);
				logger.warn(err);
			}
		}
	}
}

import { Listener } from 'discord-akairo';
import { TwitterStream, Tweet } from '../twitter';
import { HackathonClient } from '../HackathonClient';
import { TextChannel, MessageAttachment, MessageEmbed } from 'discord.js';
import { loadImage, createCanvas } from 'canvas';

export default class ReadyListener extends Listener {
	private twitter?: TwitterStream;
	private readonly started: Date;

	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
		this.started = new Date();
	}

	private async transformImage(url: string) {
		const watermark = (this.client as HackathonClient).config.twitter.watermark;
		const image = await loadImage(`${url}?name=medium`);
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		ctx.drawImage(watermark, image.width - watermark.width - 10, image.height - watermark.height - 10);
		return new MessageAttachment(canvas.toBuffer(), `tweet.jpg`);
	}

	private async transformTweet(tweet: Tweet) {
		const image = tweet.extended_entities?.media?.find(entity => entity.type === 'photo');
		if (!image || tweet.extended_entities?.media?.some(entity => entity.type !== 'photo')) return undefined;
		const file = await this.transformImage(image.media_url);

		return new MessageEmbed()
			.setAuthor(`${tweet.user.name} (${tweet.user.screen_name})`, tweet.user.profile_image_url)
			.setDescription(tweet.text)
			.setColor(0x1DA1F2)
			.setTimestamp(new Date(tweet.created_at))
			.attachFiles([file])
			.setImage('attachment://tweet.jpg');
	}

	public exec() {
		const client = this.client as HackathonClient;
		const logger = client.config.loggers.twitter;
		if (!this.twitter) {
			this.twitter = new TwitterStream({
				...client.config.twitter,
				search: { q: '#studenthack2020 OR @studenthack2020' },
				interval: 5000,
				logger
			});
			this.twitter.on('data', async (tweet: Tweet) => {
				const tweetURL = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
				if (new Date(tweet.created_at) < this.started) return false;
				const guildID = client.config.discord.guildID;
				const channel = client.guilds.cache.get(guildID)?.channels.cache
					.find(c => c.type === 'text' && c.name === 'twitter-staging') as TextChannel | undefined;
				if (!channel) {
					logger.warn(`No staging channel for tweet ${tweetURL} in ${guildID}`);
					return;
				}
				const embed = await this.transformTweet(tweet);
				if (embed) embed.addField('URL', `[Visit Tweet](${tweetURL})`);
				channel.send(embed ? '' : tweetURL, { embed })
					.then(() => logger.info(`Staged tweet ${tweetURL}`))
					.catch(err => {
						logger.warn(`Failed to stage tweet ${tweetURL}:`);
						logger.warn(err);
					});
			});
			this.twitter.on('warn', (error: Error) => {
				logger.warn('Error on Twitter update stream:');
				logger.warn(error);
			});
		}
	}
}

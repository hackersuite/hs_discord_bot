import { Listener } from 'discord-akairo';
import { TwitterStream, Tweet } from '../twitter';
import { HackathonClient } from '../HackathonClient';
import { TextChannel } from 'discord.js';

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
			this.twitter.on('data', (tweet: Tweet) => {
				if (new Date(tweet.created_at) < this.started) return false;
				const tweetURL = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
				const guildID = client.config.discord.guildID;
				const channel = client.guilds.cache.get(guildID)?.channels.cache
					.find(c => c.type === 'text' && c.name === 'twitter-staging') as TextChannel | undefined;
				if (!channel) {
					logger.warn(`No staging channel for tweet ${tweetURL} in ${guildID}`);
					return;
				}
				channel.send(tweetURL)
					.then(() => logger.info(`Staged tweet ${tweetURL}`))
					.catch(err => {
						logger.warn(`Failed to stage tweet ${tweetURL}:`);
						logger.warn(err);
					});
			});
		}
	}
}

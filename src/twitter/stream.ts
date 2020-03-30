import { Readable } from 'stream';
import { TwitterClient, TwitterClientConfig, SearchOptions } from './client';

interface TwitterStreamConfig extends TwitterClientConfig, SearchOptions {
	interval: number;
}

/**
 * Periodically searches for new tweets matching the given filters.
 * Pushes the URL for each tweet.
 * @example
 * // Checks for new tweets every 5 seconds that match the given query
 * const stream = new TwitterStream({
 *   consumerKey,
 *   consumerSecret,
 *   q: '#studenthack2020 OR @studenthack2020',
 *   interval: 5000
 * });
 *
 * stream.on('data', tweetURL => console.log(tweetURL));
 */
export class TwitterStream extends Readable {
	private readonly client: TwitterClient;
	private readonly config: TwitterStreamConfig;
	private timeout?: NodeJS.Timeout;

	public constructor(config: TwitterStreamConfig) {
		super({ encoding: 'utf8', objectMode: true });
		this.client = new TwitterClient(config);
		this.config = config;
	}

	public async _read() {
		if (this.timeout === undefined) {
			await this.client.generateBearerToken();
			this.fetch();
		}
	}

	private async fetch(since?: string) {
		const { tweets, maxTweet } = await this.client.searchTweets({
			...this.config,
			since_id: since || this.config.since_id
		});
		for (const tweet of tweets) {
			if (!this.push(tweet)) {
				return;
			}
		}
		this.timeout = setTimeout(() => this.fetch(maxTweet), this.config.interval);
	}

	public _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		callback(error);
	}
}

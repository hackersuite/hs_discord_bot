import { Readable } from 'stream';
import { TwitterClient, TwitterClientConfig, SearchOptions } from './client';
import { Logger } from 'pino';

interface TwitterStreamConfig extends TwitterClientConfig {
	interval: number;
	logger: Logger;
	search: SearchOptions;
}

/**
 * Periodically searches for new tweets matching the given filters.
 * Pushes all tweets.
 * @example
 * // Checks for new tweets every 5 seconds that match the given query
 * const stream = new TwitterStream({
 *   consumerKey,
 *   consumerSecret,
 *   logger,
 *   search: { q: '#studenthack2020 OR @studenthack2020' },
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
		super({ objectMode: true });
		this.client = new TwitterClient(config);
		this.config = config;
	}

	public async _read() {
		if (this.timeout === undefined) {
			try {
				await this.client.generateBearerToken();
			} catch (error) {
				this.destroy(error);
				return;
			}
			this.fetch().catch(err => this.emit('warn', err));
		}
	}

	private async fetch(since?: string) {
		try {
			const response = await this.client.searchTweets({
				...this.config.search,
				since_id: since ?? this.config.search.since_id
			});
			for (const tweet of response.statuses) {
				if (!this.push(tweet)) {
					return;
				}
			}
			this.timeout = setTimeout(() => {
				void this.fetch(response.search_metadata.max_id_str);
			}, this.config.interval);
		} catch (error) {
			this.emit('warn', error);
			this.timeout = setTimeout(() => {
				void this.fetch(since);
			}, this.config.interval * 5);
		}
	}

	public _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		callback(error);
	}
}

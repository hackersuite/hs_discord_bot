import fetch from 'node-fetch';
import FormData from 'form-data';
import { stringify, ParsedUrlQueryInput } from 'querystring';

interface OAuth2Response {
	token_type: string;
	access_token: string;
}

// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
interface SearchResponse {
	statuses: Tweet[];
	search_metadata: {
		max_id_str: string;
		refresh_url: string;
	};
}

// This is very minimally defined, only what we need for a Hackathon
export interface Tweet {
	id_str: string;
	created_at: string;
	user: {
		screen_name: string;
	};
}

export interface TwitterClientConfig {
	consumerKey: string;
	consumerSecret: string;
}

export interface SearchOptions extends ParsedUrlQueryInput {
	q: string;
	geocode?: string;
	lang?: string;
	locale?: string;
	result_type?: 'mixed' | 'recent' | 'popular';
	count?: number;
	until?: string;
	since_id?: string;
	max_id?: string;
	include_entities?: string;
}

export class TwitterClient {
	private readonly config: TwitterClientConfig;
	private bearerToken?: string;

	public constructor(config: TwitterClientConfig) {
		this.config = config;
	}

	public async generateBearerToken() {
		const body = new FormData();
		body.append('grant_type', 'client_credentials');
		const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
		const apiResponse = await fetch('https://api.twitter.com/oauth2/token', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${auth}`
			},
			body
		});
		const data: OAuth2Response = await apiResponse.json();
		if (data.token_type !== 'bearer' || !data.access_token) {
			throw new Error(`Did not get a bearer token: ${JSON.stringify(data)}`);
		}
		this.bearerToken = data.access_token;
		return data.access_token;
	}

	/**
	 * Searches tweets matching the given options, and returns their URLs
	 */
	public async searchTweets(options: SearchOptions) {
		if (!this.bearerToken) {
			throw new Error('No bearer token! Try running client.generateBearerToken() first');
		}
		const apiResponse = await fetch(`https://api.twitter.com/1.1/search/tweets.json?${stringify(options)}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${this.bearerToken}`
			}
		});
		return await apiResponse.json() as SearchResponse;
	}
}

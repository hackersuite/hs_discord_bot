import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

export enum AuthLevel {
	Unverified,
	Applicant,
	Attendee,
	Volunteer,
	Organiser
}

const AuthLevelMap = {
	unverified: AuthLevel.Unverified,
	applicant: AuthLevel.Applicant,
	attendee: AuthLevel.Attendee,
	volunteer: AuthLevel.Volunteer,
	organiser: AuthLevel.Organiser
};

export interface AuthClientOptions {
	token: string;
	apiBase: string;
}

interface APIResponse {
	status: number;
	error?: string;
}

interface APIResponseCurrentUser extends APIResponse {
	user: APIUserExtended;
}

interface APIResponseUsers extends APIResponse {
	users: APIUser[];
}

interface APIResponseTeams extends APIResponse {
	teams: APITeam[];
}

class APIError extends Error {
	public response: Response;
	public constructor(message: string, response: Response) {
		super(message);
		this.response = response;
	}
}

interface APIUser {
	_id: string;
	name: string;
	email: string;
	auth_level: 'unverified' | 'applicant' | 'attendee' | 'volunteer' | 'organiser';
	team: string;
}

interface APIUserExtended extends APIUser {
	email_verified: boolean;
}

interface APITeam {
	_id: string;
	name: string;
	creator: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	authLevel: AuthLevel;
	team: string | null;
}

export interface UserExtended extends User {
	emailVerified: boolean;
}

export interface Team {
	id: string;
	name: string;
	creator: string;
}

export class AuthClient {
	private readonly API_BASE: string;
	private readonly token: string;

	public constructor(options: AuthClientOptions) {
		this.API_BASE = options.apiBase;
		this.token = options.token;
	}

	private async fetch(endpoint: RequestInfo, extra?: RequestInit): Promise<APIResponse> {
		const response = await fetch(`${this.API_BASE}/api/v1/${endpoint}`, {
			headers: { Authorization: this.token },
			...extra
		});
		const data = await response.json() as APIResponse;
		if (data.status < 200 || data.status >= 300) {
			throw new APIError(`Non-OK status: ${data.status}`, response);
		}
		if (data.error) {
			throw new APIError(`Error: ${data.error}`, response);
		}
		return data;
	}

	public async getCurrentUser(): Promise<UserExtended> {
		const { user } = await this.fetch('users/me') as APIResponseCurrentUser;
		return {
			id: user._id,
			name: user.name,
			team: Number(user.team) === 0 ? null : user.team,
			emailVerified: user.email_verified,
			email: user.email,
			authLevel: AuthLevelMap[user.auth_level]
		};
	}

	public async getUsers(): Promise<Map<string, User>> {
		const { users } = await this.fetch('users') as APIResponseUsers;
		const map: Map<string, User> = new Map();
		for (const user of users) {
			map.set(user._id, {
				id: user._id,
				name: user.name,
				team: Number(user.team) === 0 ? null : user.team,
				email: user.email,
				authLevel: AuthLevelMap[user.auth_level]
			});
		}
		return map;
	}

	public async getUser(id: string): Promise<User> {
		const user = (await this.getUsers()).get(id);
		if (!user) {
			throw new Error(`User '${id}' does not exist!`);
		}
		return user;
	}

	public async getTeams(): Promise<Map<string, Team>> {
		const { teams } = await this.fetch('teams') as APIResponseTeams;
		const map: Map<string, Team> = new Map();
		for (const team of teams) {
			map.set(team._id, {
				id: team._id,
				creator: team.creator,
				name: team.name
			});
		}
		return map;
	}

	public async getTeam(id: string): Promise<Team> {
		const team = (await this.getTeams()).get(id);
		if (!team) {
			throw new Error(`Team '${id}' does not exist!`);
		}
		return team;
	}
}


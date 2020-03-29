import { Connection } from 'typeorm';
import { Guild, GuildMember } from 'discord.js';
import { AuthClient } from '../hs_auth/client';
import { ensureTeamEntity } from './database/team';
import { FullTeam, ensureTeamChannel } from './discord/team';
import { ensureUserLinked } from './database/user';
import { ensureUserRoles } from './discord/user';

export interface IdentifyData {
	connection: Connection;
	member: GuildMember;
	authClient: AuthClient;
	authId: string;
}

interface TeamResolveData {
	authClient: AuthClient;
	connection: Connection;
	teamAuthId: string;
	guild: Guild;
}

async function resolveAndEnsureTeam({ authClient, connection, teamAuthId, guild }: TeamResolveData): Promise<FullTeam> {
	const authTeam = await authClient.getTeam(teamAuthId);
	const teamEntity = await ensureTeamEntity(connection, teamAuthId);
	const fullTeam: FullTeam = { ...teamEntity, ...authTeam };
	await ensureTeamChannel(guild, fullTeam);
	return fullTeam;
}

/**
 * Attempts to link a user's Discord account to their hs_auth account.
 * It will create any necessary team role/channel if one does not exist and assign this to them.
 * @param data
 */
export async function identify(data: IdentifyData) {
	const { connection, member, authClient, authId } = data;

	const authUser = await authClient.getUser(authId);
	let team: FullTeam | undefined;
	if (authUser.team) {
		team = await resolveAndEnsureTeam({
			authClient,
			connection,
			teamAuthId: authUser.team,
			guild: member.guild
		});
	}

	await ensureUserLinked(connection, authUser.id, member.id);
	await ensureUserRoles(member, authUser, team?.teamNumber);

	return { authUser, teamNumber: team?.teamNumber };
}

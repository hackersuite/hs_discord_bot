import { Guild, Role } from 'discord.js';
import { Team as AuthTeam } from '../../hs_auth/client';
import { Team as TeamEntity } from '../../database/entities/Team';
import { teamChannelName, teamRoleName, teamChannelTopic } from './mappings';

/**
 * Stores both the information about a team from hs_auth, as well as Discord-specific info
 */
export type FullTeam = AuthTeam & TeamEntity;

/**
 * Ensures a team's role exists in a Guild.
 */
export async function ensureTeamRole(guild: Guild, teamNumber: number): Promise<Role> {
	const roleName = teamRoleName(teamNumber);
	const role = guild.roles.cache.find(role => role.name === roleName);
	if (role) {
		return role;
	}
	return guild.roles.create({
		data: {
			name: roleName
		}
	});
}

/**
 * Ensures a team's channel exists and that permissions are correctly configured.
 * If the team's role does not exist, it will try to create it.
 */
export async function ensureTeamChannel(guild: Guild, team: FullTeam) {
	const teamsCategory = guild.channels.cache.find(c => c.type === 'category' && c.name === 'Teams');
	if (!teamsCategory) {
		throw new Error(`No teams category channel in ${guild.id}!`);
	}
	const channelName = teamChannelName(team.teamNumber);
	const channel = guild.channels.cache.find(c => c.type === 'text' && c.name === channelName);
	if (channel) {
		return channel;
	}
	return guild.channels.create(channelName, {
		parent: teamsCategory.id,
		topic: teamChannelTopic(team),
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['VIEW_CHANNEL']
			},
			{
				id: (await ensureTeamRole(guild, team.teamNumber)).id,
				allow: ['VIEW_CHANNEL']
			}
		]
	});
}

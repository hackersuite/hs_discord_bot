import { GuildMember } from 'discord.js';
import { User } from '../../hs_auth/client';
import { teamRoleName } from './mappings';

const AUTH_LEVELS = ['Unverified', 'Applicant', 'Attendee', 'Volunteer', 'Organiser'];

/**
 * Stores both the information about a user from hs_auth, and their Discord ID.
 */
export interface FullUser extends User { discordId: string }

/*
	Ensures that a user has the correct roles on the Hackathon guild.
	If their team's role does not exist, an error will be thrown.
*/
export async function ensureUserRoles(member: GuildMember, authUser: User, teamNumber?: number) {
	const guildRoles = member.guild.roles;

	const linkedRole = member.guild.roles.cache.find(role => role.name === 'Account Linked');
	if (!linkedRole) {
		throw new Error(`Could not find the linked role for the guild ${member.guild.id}`);
	}

	const authRole = guildRoles.cache.find(role => role.name === AUTH_LEVELS[authUser.authLevel]);
	if (!authRole) {
		throw new Error(`Could not find auth role for authLevel ${authUser.authLevel}`);
	}

	const expectedRoles = [linkedRole, authRole];

	if (teamNumber) {
		const roleName = teamRoleName(teamNumber);
		const teamRole = member.guild.roles.cache.find(role => role.name === roleName);
		if (!teamRole) {
			throw new Error(`Could not find team role for team ${teamNumber}`);
		}
		expectedRoles.push(teamRole);
	}

	// If the member has the correct roles, no need to make an API request to update
	if (
		member.roles.cache.size === expectedRoles.length &&
		expectedRoles.every(role => member.roles.cache.has(role.id))
	) {
		return member;
	}
	return member.roles.set(expectedRoles);
}

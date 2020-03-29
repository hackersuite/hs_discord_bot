import { Guild, Role, MessageEmbed, TextChannel } from 'discord.js';
import { Team as AuthTeam } from '../../hs_auth/client';
import { Team as TeamEntity } from '../../database/entities/Team';
import { teamChannelName, teamRoleName, teamChannelTopic } from './mappings';

const teamJoinMessage =
	'This is your private team chat, only members of your team and organisers can access it.\n\n' +
	'If members of your team are missing, make sure that they have signed up on the ' +
	'[StudentHack website](https://auth.studenthack2020.com/) and have then identified with me. ' +
	'If they identified with me and _then_ joined the team, they may need to reidentify.\n\n' +
	'If you need any further assistance, feel free to message in the Hackathon channels above.\n\n' +
	'Have fun and good luck!';

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
	let channel = guild.channels.cache.find(
		c => c.type === 'text' && c.name === channelName
	) as TextChannel | undefined;
	if (channel) {
		return channel;
	}
	channel = await guild.channels.create(channelName, {
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
	const embed = new MessageEmbed()
		.setTitle(`Welcome "${team.name}"! ✨`)
		.setDescription(teamJoinMessage)
		.setColor('#fa66c1');
	await channel.send(embed);
	return channel;
}

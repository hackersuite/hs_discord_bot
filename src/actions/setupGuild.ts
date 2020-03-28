import { Guild, RoleData } from 'discord.js';
import { ApplicationConfig } from '../util/config-loader';

/*
    Unverified = 0,
    Applicant = 1,
    Attendee = 2,
    Volunteer = 3,
	Organiser = 4
*/

interface GuildSetupData {
	guild: Guild;
	config: ApplicationConfig;
}

function makeRole(guild: Guild, data: RoleData) {
	return guild.roles.create({ data, reason: 'Configuring Hackathon Guild' });
}


/*
	Configures an (ideally empty) guild to be used as the Hackathon Guild.

	- Creates roles
		- Account Linked
		- Auth Level: Unverified
		- Applicant
		- Attendee
		- Volunteer
		- Organiser
	- Creates a restricted "Teams" category channel.
*/
export async function setupGuild(data: GuildSetupData) {
	const { guild } = data;

	const organiser = await makeRole(guild, { name: 'Organiser' });
	const volunteer = await makeRole(guild, { name: 'Volunteer' });
	await makeRole(guild, { name: 'Attendee' });
	await makeRole(guild, { name: 'Applicant' });
	await makeRole(guild, { name: 'Unverified' });
	await makeRole(guild, { name: 'Account Linked' });

	const staff = await guild.channels.create('Staff', {
		type: 'category',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['VIEW_CHANNEL']
			},
			{
				id: volunteer.id,
				allow: ['VIEW_CHANNEL']
			},
			{
				id: organiser.id,
				allow: ['VIEW_CHANNEL']
			}
		]
	});

	await guild.channels.create('staff-discussion', {
		type: 'text',
		parent: staff.id,
		topic: 'A discussion channel for organisers and volunteers!'
	});

	await guild.channels.create('Staff Voice Chat', {
		type: 'voice',
		parent: staff.id
	});

	await guild.channels.create('Teams', {
		type: 'category',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['VIEW_CHANNEL']
			},
			{
				id: volunteer.id,
				allow: ['VIEW_CHANNEL']
			},
			{
				id: organiser.id,
				allow: ['VIEW_CHANNEL']
			}
		]
	});

	return true;
}

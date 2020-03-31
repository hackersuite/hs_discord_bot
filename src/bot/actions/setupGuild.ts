import { Guild, RoleData, MessageEmbed } from 'discord.js';
import { ApplicationConfig } from '../util/config';

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

	await guild.setRegion('london');

	const organiser = await makeRole(guild, { name: 'Organiser' });
	const volunteer = await makeRole(guild, { name: 'Volunteer' });
	await makeRole(guild, { name: 'Attendee' });
	await makeRole(guild, { name: 'Applicant' });
	await makeRole(guild, { name: 'Unverified' });
	const accountLinked = await makeRole(guild, { name: 'Account Linked' });

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

	await guild.channels.create('twitter-staging', {
		type: 'text',
		parent: staff.id,
		topic: 'Where tweets get sent to be approved'
	});

	await guild.channels.create('Staff Voice Chat', {
		type: 'voice',
		parent: staff.id
	});

	//
	// Hackathon
	//
	const hackathon = await guild.channels.create('Hackathon', {
		type: 'category',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['VIEW_CHANNEL']
			},
			{
				id: accountLinked.id,
				allow: ['VIEW_CHANNEL']
			}
		]
	});

	await guild.channels.create('announcements', {
		type: 'text',
		parent: hackathon.id,
		topic: 'Important announcements from the organisers!',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['SEND_MESSAGES']
			},
			{
				id: organiser.id,
				allow: ['SEND_MESSAGES', 'ATTACH_FILES']
			}
		]
	});

	await guild.channels.create('events', {
		type: 'text',
		parent: hackathon.id,
		topic: 'Events you can participate in!',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['SEND_MESSAGES']
			},
			{
				id: organiser.id,
				allow: ['SEND_MESSAGES', 'ATTACH_FILES']
			}
		]
	});

	await guild.channels.create('twitter', {
		type: 'text',
		parent: hackathon.id,
		topic: 'The #studenthack2020 Twitter feed!',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['SEND_MESSAGES']
			}
		]
	});

	const social = await guild.channels.create('social', {
		type: 'text',
		parent: hackathon.id,
		topic: 'Talk to other participants here!',
		rateLimitPerUser: 5
	});

	const embed = new MessageEmbed()
		.setTitle('Social')
		.setDescription(
			'Chat to other participants here about anything! Make sure to be respectful, ' +
			'abusive or distasteful messages/images will be removed and you could lose access to this channel!'
		)
		.setColor('#fa9f66');
	await social.send(embed);

	const findATeam = await guild.channels.create('find-a-team', {
		type: 'text',
		parent: hackathon.id,
		topic: 'A place where you can find other teammates!',
		rateLimitPerUser: 5
	});

	embed
		.setTitle('Find a Team')
		.setDescription(
			'Chat here to find a team or some extra team mates!\n\n' +
			'Once you\'ve found a team, visit [the website](http://auth.studenthack2020.com/) to create/' +
			'join the team. Make sure to reidentify once you have done this!'
		);
	await findATeam.send(embed);

	const registration = await guild.channels.create('registration', {
		type: 'text',
		parent: hackathon.id,
		topic: 'Register first to gain full access to the server.',
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ['SEND_MESSAGES']
			},
			{
				id: accountLinked.id,
				deny: ['VIEW_CHANNEL']
			}
		]
	});
	embed
		.setTitle('You need to link your StudentHack account to gain access!')
		.setDescription(
			'Before you can fully access the StudentHack server, you need to link your Discord account to ' +
			'your StudentHack account.\n\n' +
			'Visit the [StudentHack website](https://auth.studenthack2020.com/) to find your ID, then ' +
			'send me a message with your ID:\n\n' +
			'e.g. **`!identify 5e615d6f22681803b48199cf`**'
		);

	await registration.send(embed);

	//
	// Teams
	//
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

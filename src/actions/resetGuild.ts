import { Guild, CategoryChannel } from 'discord.js';

/*
    Unverified = 0,
    Applicant = 1,
    Attendee = 2,
    Volunteer = 3,
	Organiser = 4
*/

interface GuildResetData {
	guild: Guild;
}


/*
	Removes Hackathon channels and roles from the server
*/
export async function resetGuild(data: GuildResetData) {
	const { guild } = data;

	const roleNames = ['Organiser', 'Volunteer', 'Attendee', 'Applicant', 'Unverified', 'Account Linked'];

	for (const role of guild.roles.cache.values()) {
		if (roleNames.includes(role.name) || role.name.startsWith('Team ')) {
			await role.delete();
		}
	}

	const categoryNames = ['Staff', 'Teams'];
	for (const categoryName of categoryNames) {
		const category = guild.channels.cache
			.find(c => c.type === 'category' && c.name === categoryName) as CategoryChannel | undefined;
		if (category) {
			for (const child of category.children.values()) {
				await child.delete();
			}
			await category.delete();
		}
	}

	return true;
}

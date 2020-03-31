import { Team } from '../../hs_auth/client';

export function teamRoleName(teamNumber: number) {
	return `Team ${teamNumber}`;
}

export function teamVoiceChannelName(teamNumber: number) {
	return `Team ${teamNumber}`;
}

export function teamTextChannelName(teamNumber: number) {
	return `team-${teamNumber}`;
}

export function teamChannelTopic(team: Team) {
	return `${team.name} | Auth ID: ${team.id}`;
}

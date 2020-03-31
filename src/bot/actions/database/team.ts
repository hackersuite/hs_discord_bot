import { Connection } from 'typeorm';
import { Team } from '../../database/entities';

export async function ensureTeamEntity(connection: Connection, authId: string): Promise<Team> {
	const repo = connection.getRepository(Team);
	let team = await repo.findOne({ where: { id: authId } });
	if (team) {
		return team;
	}
	team = new Team();
	team.id = authId;
	return repo.save(team);
}

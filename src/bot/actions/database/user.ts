import { User } from '../../database/entities';
import { Connection } from 'typeorm';

export async function ensureUserLinked(connection: Connection, authUserId: string, discordId: string) {
	const userRepo = await connection.getRepository(User);
	// The user associated with this Discord account
	let user = await userRepo.findOne({ where: { id: discordId } });
	if (user) {
		return user;
	}
	user = new User();
	user.id = discordId;
	user.authId = authUserId;
	return userRepo.save(user);
}

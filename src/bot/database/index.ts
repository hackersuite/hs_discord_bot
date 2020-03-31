import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User, Team } from './entities';

export function createDBConnection() {
	return createConnection({
		type: 'sqlite',
		database: './data/database.sqlite',
		entities: [User, Team],
		logging: false,
		synchronize: true
	});
}

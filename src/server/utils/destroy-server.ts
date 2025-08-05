import dotenv from 'dotenv';
import { destroyDB } from '../../db/utils/init-db';
import { destroyDB as destroyUserDB } from '@ampkz/auth-neo4j/db';

dotenv.config();

async function destroy() {
	await destroyDB();
	await destroyUserDB();
	process.exit(0);
}

destroy();

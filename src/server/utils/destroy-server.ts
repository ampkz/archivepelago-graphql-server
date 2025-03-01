import dotenv from 'dotenv';
import { destroyDBs } from '../../db/utils/init-dbs';

dotenv.config();

async function destroy() {
	await destroyDBs();
	process.exit(0);
}

destroy();

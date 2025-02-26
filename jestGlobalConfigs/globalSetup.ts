import dotenv from 'dotenv';
import { initializeDBs } from '../src/db/utils/init-dbs';

module.exports = async () => {
	dotenv.config();
	await initializeDBs();
};

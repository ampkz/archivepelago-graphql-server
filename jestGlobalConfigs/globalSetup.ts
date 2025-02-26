import { initializeDBs } from '../src/db/utils/init-dbs';
import dotenv from 'dotenv';

module.exports = async () => {
	dotenv.config();
	await initializeDBs();
};

import dotenv from 'dotenv';
import { initializeDB } from '../src/db/utils/init-db';

module.exports = async () => {
	dotenv.config();
	await initializeDB();
};

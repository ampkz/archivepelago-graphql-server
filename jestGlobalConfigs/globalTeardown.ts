import { destroyDB } from '../src/db/utils/init-db';

module.exports = async () => {
	await destroyDB();
};

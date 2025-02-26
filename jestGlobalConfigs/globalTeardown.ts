import { destroyDBs } from '../src/db/utils/init-dbs';

module.exports = async () => {
	await destroyDBs();
};

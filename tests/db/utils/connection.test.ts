import { connect, Errors as DB_CONNECTION_ERRORS } from '../../../src/db/utils/connection';
import { Driver, ServerInfo } from 'neo4j-driver';
import { InternalError } from '../../../src/_helpers/errors-helper';

describe(`DB Connection Tests`, () => {
	const originalEnv: NodeJS.ProcessEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it(`should connect to the DB`, async () => {
		const driver: Driver = await connect();
		const serverInfo: ServerInfo = await driver.getServerInfo();
		await driver.close();
		expect(serverInfo.address).toEqual(`${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`);
	});

	it(`should throw an error with an incorrect password`, async () => {
		process.env = {
			...originalEnv,
			NEO4J_PWD: `incorrect password`,
		};
		await expect(connect()).rejects.toThrow(DB_CONNECTION_ERRORS.DB_CONNECTION_ERROR);
	});

	it(`should throw an InternalError with code 500 with an incorrect password`, async () => {
		process.env = {
			...originalEnv,
			NEO4J_PWD: `incorrect password`,
		};

		try {
			await connect();
		} catch (error) {
			expect(error instanceof InternalError).toBeTruthy();
			expect((error as InternalError).getCode()).toEqual(500);
			expect((error as InternalError).getData().issue).toEqual(DB_CONNECTION_ERRORS.DB_CONNECTION_UNAUTHORIZED);
		}

		expect(true).toBeTruthy();
	});
});

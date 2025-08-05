import neo4j, { Driver } from 'neo4j-driver';
import { InternalError } from '@ampkz/auth-neo4j/errors';

export enum Errors {
	DB_CONNECTION_UNAUTHORIZED = 'Unauthorized Connection to Driver',
}

export async function connect(): Promise<Driver> {
	const driver: Driver = neo4j.driver(
		`bolt://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`,
		neo4j.auth.basic(process.env.NEO4J_USER as string, process.env.NEO4J_PWD as string)
	);

	try {
		// Will throw an error if not authenticated
		await driver.getServerInfo();
	} catch (error) {
		throw new InternalError(Errors.DB_CONNECTION_UNAUTHORIZED, { cause: error });
	}

	return driver;
}

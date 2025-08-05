import { connect } from './connection';
import { Driver, Session, RecordShape, Record } from 'neo4j-driver';
import { getSessionOptions } from '../../_helpers/db-helper';
import { InternalError } from '@ampkz/auth-neo4j/errors';

export enum ErrorMsgs {
	COULD_NOT_CREATE_DB = 'Could Not Create Database',
	COULD_NOT_CREATE_CONSTRAINT = 'Could Not Create Constraint',
	CONSTRAINT_ALREADY_EXISTS = 'Constrain Already Exists',
}

export async function initializeDB(): Promise<boolean> {
	const driver: Driver = await connect();
	let session = driver.session();
	const match = await session.run(`CREATE DATABASE ${getSessionOptions(process.env.ARCHIVE_DB as string).database} IF NOT EXISTS WAIT`);

	if ((match.records[0] as Record).get(`address`) != `${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`) {
		await session.close();
		await driver.close();
		throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_DB);
	}

	await session.close();

	session = driver.session({ database: getSessionOptions(process.env.ARCHIVE_DB as string).database });

	await initializeConstraint(session, 'Person', 'id');
	await initializeConstraint(session, 'Label', 'name');
	await initializeConstraint(session, 'Correspondence', 'correspondenceID');

	await driver.close();

	return true;
}

async function initializeConstraint(session: Session, identifier: string, property: string, isRelationship: boolean = false): Promise<boolean> {
	const constraintName: string = `${identifier.toLowerCase()}_${property.toLowerCase()}`;
	let query: string;

	if (isRelationship) {
		query = `CREATE CONSTRAINT ${constraintName} IF NOT EXISTS FOR ()-[r:${identifier}]-() REQUIRE r.${property} IS RELATIONSHIP KEY`;
	} else {
		query = `CREATE CONSTRAINT ${constraintName} IF NOT EXISTS FOR (n:${identifier}) REQUIRE n.${property} IS NODE KEY`;
	}

	const match: RecordShape = await session.run(query);

	if (match.summary.counters._stats.constraintsAdded !== 1) {
		throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_CONSTRAINT, {
			cause: { issue: ErrorMsgs.CONSTRAINT_ALREADY_EXISTS, constraintName },
		});
	}
	return true;
}

// export async function initializeConstraint(dbName: string, node: string, property: string, nodeKey: boolean = false): Promise<boolean> {
// 	const driver: Driver = await connect();
// 	const session: Session = driver.session(getSessionOptions(dbName));

// 	const constraintNameBase: string = `${node.toLowerCase()}_${property.toLowerCase()}`;

// 	let match: RecordShape;

// 	if (!nodeKey) {
// 		// match = await session.run(`CREATE CONSTRAINT ${constraintNameBase}_exists IF NOT EXISTS FOR (n:${node}) REQUIRE n.${property} IS NOT NULL`);
// 		// if (match.summary.counters._stats.constraintsAdded !== 1) {
// 		// 	session.close();
// 		// 	driver.close();
// 		// 	throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_CONSTRAINT, {
// 		// 		issue: ErrorMsgs.CONSTRAINT_ALREADY_EXISTS,
// 		// 		constraintName: constraintNameBase + '_exists',
// 		// 	});
// 		// }

// 		match = await session.run(`CREATE CONSTRAINT ${constraintNameBase}_unique IF NOT EXISTS FOR (n:${node}) REQUIRE n.${property} IS UNIQUE`);

// 		if (match.summary.counters._stats.constraintsAdded !== 1) {
// 			session.close();
// 			driver.close();
// 			throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_CONSTRAINT, {
// 				issue: ErrorMsgs.CONSTRAINT_ALREADY_EXISTS,
// 				constraintName: constraintNameBase + '_unique',
// 			});
// 		}
// 	} else {
// 		match = await session.run(`CREATE CONSTRAINT ${constraintNameBase}_key IF NOT EXISTS FOR (n:${node}) REQUIRE n.${property} IS NODE KEY`);

// 		if (match.summary.counters._stats.constraintsAdded !== 1) {
// 			session.close();
// 			driver.close();
// 			throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_CONSTRAINT, {
// 				issue: ErrorMsgs.CONSTRAINT_ALREADY_EXISTS,
// 				constraintName: constraintNameBase + '_key',
// 			});
// 		}
// 	}

// 	await session.close();
// 	await driver.close();
// 	return true;
// }

export async function verifyDB(dbName: string): Promise<boolean> {
	const driver: Driver = await connect();
	const session: Session = driver.session();
	const match: RecordShape = await session.run(`SHOW DATABASE ${dbName}`);
	await session.close();
	await driver.close();
	return match.records.length === 1;
}

export async function destroyDB(): Promise<void> {
	const driver: Driver = await connect();
	const session: Session = driver.session();
	await session.run(`DROP DATABASE ${getSessionOptions(process.env.ARCHIVE_DB as string).database} IF EXISTS DESTROY DATA WAIT`);
	await session.close();
	await driver.close();
}

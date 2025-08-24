import { Driver, RecordShape, Session } from 'neo4j-driver';
import { connect } from './connection';
import { getSessionOptions } from '../../_helpers/db-helper';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { NodeType } from '../../_helpers/nodes';

export enum Errors {
	CANNOT_CREATE_NODE = 'Cannot Create Node',
	CANNOT_MATCH_NODE = 'Cannot Match Node',
	CANNOT_DELETE_NODE = 'Cannot Delete Node',
	CANNOT_UPDATE_NODE = 'Cannot Update Node',
}

export async function createNode(
	nodeType: NodeType,
	idProps: string[],
	params: object,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<any | null> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	let createdNode: object | null = null;

	try {
		const match: RecordShape = await session.run(`CREATE(n:${nodeType} { ${idProps.join(', ')} }) RETURN n`, params);

		if (match.summary.counters._stats.nodesCreated !== 1) {
			await session.close();
			await driver.close();

			throw new InternalError(Errors.CANNOT_CREATE_NODE);
		} else {
			createdNode = match.records[0].get(0).properties;
		}
	} catch (error: unknown) {
		await session.close();
		await driver.close();

		throw new InternalError(Errors.CANNOT_CREATE_NODE, { cause: error });
	}

	await session.close();
	await driver.close();

	return createdNode;
}

export async function getNode(
	nodeType: string,
	idProps: string[],
	params: object,
	dbName: string = process.env.ARCHIVE_DB as string,
	existingSession?: Session
): Promise<any | null> {
	let driver: Driver | null = null;
	let session: Session;

	if (existingSession) {
		session = existingSession;
	} else {
		driver = await connect();
		session = driver.session(getSessionOptions(dbName));
	}

	let matchedNode: any | null = null;

	try {
		const match: RecordShape = await session.run(`MATCH(n:${nodeType} { ${idProps.join(', ')} }) RETURN n`, params);

		if (match.records.length === 1) {
			matchedNode = match.records[0].get(0).properties;
		}
	} catch (error: unknown) {
		if (driver) {
			await session.close();
			await driver.close();
		}

		throw new InternalError(Errors.CANNOT_MATCH_NODE, { cause: error });
	}

	if (driver) {
		await session.close();
		await driver.close();
	}

	return matchedNode;
}

export async function getNodes(nodeType: string, dbName: string = process.env.ARCHIVE_DB as string): Promise<any[]> {
	const nodes: any[] = [];
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	const match = await session.run(`MATCH (n:${nodeType}) RETURN n`);

	match.records.map(record => {
		nodes.push(record.get(0).properties);
	});

	await session.close();
	await driver.close();
	return nodes;
}

export async function deleteNode(
	nodeType: NodeType,
	idProps: string[],
	params: object,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<any | null> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	const matchedNode: any | null = await getNode(nodeType, idProps, params, dbName, session);

	if (matchedNode) {
		let match: RecordShape;

		try {
			match = await session.run(`MATCH(n:${nodeType} { ${idProps.join(', ')} }) DETACH DELETE n`, params);

			if (match.summary.counters._stats.nodesDeleted !== 1) {
				await session.close();
				await driver.close();
				throw new InternalError(Errors.CANNOT_DELETE_NODE);
			}
		} catch (error: unknown) {
			await session.close();
			await driver.close();

			throw new InternalError(Errors.CANNOT_DELETE_NODE, { cause: error });
		}
	}

	await session.close();
	await driver.close();

	return matchedNode;
}

// idProp should have a corresponding property name in the params obj
// e.g. if idProp = "email", the params object should at least contain { email: "some@email.com" }
export async function updateNode(
	nodeType: NodeType,
	nodePrefix: string,
	idProps: string[],
	updatedProps: string[],
	params: object,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<any | null> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	let match: RecordShape | null = null;

	try {
		match = await session.run(
			`MATCH(${nodePrefix}:${nodeType} { ${idProps.join(', ')} }) SET ${updatedProps.join(', ')} RETURN ${nodePrefix}`,
			params
		);
	} catch (error: unknown) {
		await session.close();
		await driver.close();

		throw new InternalError(Errors.CANNOT_UPDATE_NODE, { cause: error });
	}

	if (match && match.records.length === 0) {
		await session.close();
		await driver.close();

		return null;
	}

	await session.close();
	await driver.close();

	return match.records[0].get(0).properties;
}

export async function removeProperties(
	nodeType: NodeType,
	nodePrefix: string,
	idProps: string[],
	propsToRemove: string[],
	params: object,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<any | null> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	let match: RecordShape | null = null;

	try {
		match = await session.run(
			`MATCH(${nodePrefix}:${nodeType} { ${idProps.join(', ')} }) REMOVE ${propsToRemove.join(', ')} RETURN ${nodePrefix}`,
			params
		);
	} catch (error: unknown) {
		await session.close();
		await driver.close();

		throw new InternalError(Errors.CANNOT_UPDATE_NODE, { cause: error });
	}

	if (match && match.records.length === 0) {
		await session.close();
		await driver.close();

		return null;
	}

	await session.close();
	await driver.close();

	return match.records[0].get(0).properties;
}

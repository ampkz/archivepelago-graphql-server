import { Driver, Record, RecordShape, Session } from 'neo4j-driver';
import { Relationship, RelationshipType } from '../../../archive/relationship/relationship';
import { connect } from '../connection';
import { getSessionOptions } from '../../../_helpers/db-helper';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { Node, NodeType } from '../../../_helpers/nodes';

export enum Errors {
	COULD_NOT_CREATE_RELATIONSHIP = 'Could not create relationship.',
	COULD_NOT_DELETE_RELATIONSHIP = 'Could not delete relationship.',
}

export async function createRelationship(
	relationship: Relationship,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<[any | null, any | null]> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	const preppedReturn: string = prepShouldReturnFromQuery(relationship);

	const match: RecordShape = await session.run(
		`MATCH (f:${relationship.node1.nodeType} {${relationship.node1.getIdString()}}), (s:${relationship.node2.nodeType} {${relationship.node2.getIdString()}}) CREATE (f)-[:${relationship.name}]->(s) ${preppedReturn.length > 0 ? `RETURN ${preppedReturn}` : ``}`,
		relationship.getRelationshipParams()
	);

	if (match.summary.counters._stats.relationshipsCreated !== 1) {
		await session.close();
		await driver.close();

		throw new InternalError(Errors.COULD_NOT_CREATE_RELATIONSHIP);
	}

	await session.close();
	await driver.close();

	return prepReturnTuple(match.records);
}

export async function deleteRelationship(
	relationship: Relationship,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<[any | null, any | null]> {
	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	const preppedReturn: string = prepShouldReturnFromQuery(relationship);

	const match: RecordShape = await session.run(
		`MATCH (f:${relationship.node1.nodeType} {${relationship.node1.getIdString()}})-[r:${relationship.name}]->(s:${relationship.node2.nodeType} {${relationship.node2.getIdString()}}) DELETE r ${preppedReturn.length > 0 ? `RETURN ${preppedReturn}` : ``}`,
		relationship.getRelationshipParams()
	);

	if (match.summary.counters._stats.relationshipsDeleted !== 1) {
		await session.close();
		await driver.close();

		throw new InternalError(Errors.COULD_NOT_DELETE_RELATIONSHIP);
	}

	await session.close();
	await driver.close();

	return prepReturnTuple(match.records);
}

export async function getRelationshipsToNode(
	node: Node,
	secondNodeType: NodeType,
	relationshipType: RelationshipType,
	undirectedMatch: boolean = false,
	dbName: string = process.env.ARCHIVE_DB as string
): Promise<any[]> {
	const relationships: any[] = [];

	const driver: Driver = await connect();
	const session: Session = driver.session(getSessionOptions(dbName));

	const match: RecordShape = await session.run(
		`MATCH (n:${node.nodeType} {${node.getIdString()}})-[:${relationshipType}]-${undirectedMatch ? '' : '>'}(m:${secondNodeType}) RETURN m`,
		node.getIdParams()
	);

	await session.close();
	await driver.close();

	match.records.map((record: Record) => {
		relationships.push(record.get(0).properties);
	});

	return relationships;
}

function prepShouldReturnFromQuery(relationship: Relationship): string {
	const shouldReturn: string[] = [];

	if (relationship.node1.shouldReturnFromQuery) shouldReturn.push('f');
	if (relationship.node2.shouldReturnFromQuery) shouldReturn.push('s');

	return shouldReturn.join(', ');
}

function prepReturnTuple(records: any): [any | null, any | null] {
	let f: any | null = null;
	let s: any | null = null;

	if (records.length > 0) {
		if (records[0].keys.includes('f')) f = records[0].get('f').properties;
		if (records[0].keys.includes('s')) s = records[0].get('s').properties;
	}

	return [f, s];
}

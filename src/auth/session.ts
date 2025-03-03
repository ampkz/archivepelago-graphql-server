import { AuthorizedUser } from './authorization';
import { connect } from '../db/utils/connection';
import { getSessionOptions } from '../_helpers/db-helper';
import crypto from 'node:crypto';
import { Neo4jError, RecordShape } from 'neo4j-driver';
import { InternalError } from '../_helpers/errors-helper';

export enum Errors {
	CANNOT_CREATE_SESSION = 'Cannot Create Session',
	ERROR_VALIDATING_TOKEN = 'Error Validating Token',
	ERROR_INVALIDATING_SESSSION = 'Error Invalidating Session',
}

export function generateSessionToken(): string {
	const token = crypto.randomBytes(20).toString('hex');
	return token;
}

export async function createSession(token: string, userEmail: string): Promise<Session | undefined> {
	const sessionID = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	let match: RecordShape;

	try {
		match = await neoSession.run(
			`MATCH (u:User { email: $userEmail}) CREATE (u)-[:HAS]->(s:Session {id: $sessionID, expiresAt: $expiresAt}) RETURN s, u`,
			{
				userEmail,
				sessionID,
				expiresAt: expiresAt.toISOString(),
			}
		);
	} catch (error: unknown) {
		await neoSession.close();
		await driver.close();

		let data = {};

		if (error instanceof Neo4jError) {
			data = { info: error.code };
		}

		throw new InternalError(Errors.CANNOT_CREATE_SESSION, data);
	}

	await neoSession.close();
	await driver.close();

	if (match.records.length === 0) {
		return undefined;
	}

	const user = match.records[0].get('u');

	const session: Session = {
		id: sessionID,
		userID: user.properties.id,
		expiresAt,
	};

	return session;
}

export async function validateSessionToken(token: string | undefined): Promise<SessionValidationResult> {
	if (!token) {
		return { session: null, user: null };
	}

	const sessionID = crypto.createHash('sha256').update(token).digest('hex');
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	let match: RecordShape;

	try {
		match = await neoSession.run(`MATCH(u:User)-[:HAS]->(s:Session {id: $sessionID}) RETURN u,s`, { sessionID });
	} catch (error) {
		await neoSession.close();
		await driver.close();

		let data = {};

		if (error instanceof Neo4jError) {
			data = { info: error.code };
		}

		throw new InternalError(Errors.ERROR_VALIDATING_TOKEN, data);
	}

	await neoSession.close();
	await driver.close();

	if (match.records.length === 0) {
		return { session: null, user: null };
	}

	const user = match.records[0].get('u').properties;
	const session = match.records[0].get('s').properties;

	//TODO invalidate/update based on time

	session.userID = user.id;
	session.expiresAt = new Date(session.expiresAt);

	const authorizedUser: AuthorizedUser = new AuthorizedUser(user.email, user.auth, user.id);

	return { session, user: authorizedUser };
}

export async function invalidateSession(sessionID: string): Promise<void> {
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	try {
		await neoSession.run(`MATCH(s:Session {id: $sessionID}) DETACH DELETE s`, { sessionID });
	} catch (error) {
		await neoSession.close();
		await driver.close();

		let data = {};

		if (error instanceof Neo4jError) {
			data = { info: error.code };
		}

		throw new InternalError(Errors.ERROR_INVALIDATING_SESSSION, data);
	}

	await neoSession.close();
	await driver.close();
}

export async function invalidateAllSessions(userEmail: string): Promise<void> {
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	try {
		await neoSession.run(`MATCH (u:User {email: $userEmail})-[:HAS]->(s:Session) DETACH DELETE s`, { userEmail });
	} catch (error) {
		await neoSession.close();
		await driver.close();

		let data = {};

		if (error instanceof Neo4jError) {
			data = { info: error.code };
		}

		throw new InternalError(Errors.ERROR_INVALIDATING_SESSSION, data);
	}

	await neoSession.close();
	await driver.close();
}

export type SessionValidationResult = { session: Session; user: AuthorizedUser } | { session: null; user: null };

export interface Session {
	id: string;
	userID: string;
	expiresAt: Date;
}

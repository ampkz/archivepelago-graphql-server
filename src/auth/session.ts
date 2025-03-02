import { AuthorizedUser } from './authorization';
import { connect } from '../db/utils/connection';
import { getSessionOptions } from '../_helpers/db-helper';
import crypto from 'node:crypto';
import { RecordShape } from 'neo4j-driver';

export function generateSessionToken(): string {
	const token = crypto.randomBytes(20).toString('hex');
	return token;
}

export async function createSession(token: string, userEmail: string): Promise<Session> {
	const sessionID = crypto.createHash('sha256').update(token).digest('hex');
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	const match: RecordShape = await neoSession.run(
		`MATCH (u:User { email: $userEmail}) CREATE (u)-[:HAS]->(s:Session {id: $sessionID, expiresAt: $expiresAt}) RETURN s, u`,
		{
			userEmail,
			sessionID,
			expiresAt: expiresAt.toISOString(),
		}
	);

	const user = match.records[0].get('u');

	const session: Session = {
		id: sessionID,
		userID: user.properties.id,
		expiresAt,
	};

	await neoSession.close();
	await driver.close();

	return session;
}

export async function validateSessionToken(token: string | undefined): Promise<SessionValidationResult> {
	if (!token) {
		return { session: null, user: null };
	}

	const sessionID = crypto.createHash('sha256').update(token).digest('hex');
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	const match: RecordShape = await neoSession.run(`MATCH(u:User)-[:HAS]->(s:Session {id: $sessionID}) RETURN u,s`, { sessionID });

	if (match.records.length === 0) {
		await neoSession.close();
		await driver.close();

		return { session: null, user: null };
	}

	const user = match.records[0].get('u').properties;
	const session = match.records[0].get('s').properties;

	//TODO invalidate/update based on time

	session.userID = user.id;
	session.expiresAt = new Date(session.expiresAt);

	const authorizedUser: AuthorizedUser = new AuthorizedUser(user.email, user.auth, user.id);

	await neoSession.close();
	await driver.close();

	return { session, user: authorizedUser };
}

export async function invalidateSession(sessionID: string): Promise<void> {
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	await neoSession.run(`MATCH(s:Session {id: $sessionID}) DETACH DELETE s`, { sessionID });

	await neoSession.close();
	await driver.close();
}

export async function invalidateAllSessions(userEmail: string): Promise<void> {
	const driver = await connect();
	const neoSession = driver.session(getSessionOptions(process.env.USERS_DB as string));

	await neoSession.run(`MATCH (u:User {email: $userEmail})-[:HAS]->(s:Session) DETACH DELETE s`, { userEmail });

	await neoSession.close();
	await driver.close();
}

export type SessionValidationResult = { session: Session; user: AuthorizedUser } | { session: null; user: null };

export interface Session {
	id: string;
	userID: string;
	expiresAt: Date;
}

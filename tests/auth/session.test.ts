import { Auth } from '../../src/auth/authorization';
import {
	createSession,
	generateSessionToken,
	invalidateAllSessions,
	invalidateSession,
	Session,
	SessionValidationResult,
	validateSessionToken,
} from '../../src/auth/session';
import { createUser } from '../../src/db/users/crud-user';
import { User } from '../../src/users/users';

describe(`Sessions tests`, () => {
	beforeAll(async () => {
		await createUser(new User('test@test', Auth.ADMIN, 'test', 'test'), 'test@test');
	});

	afterEach(async () => {
		invalidateAllSessions('test@test');
	});

	it(`should generate a session token`, () => {
		const token = generateSessionToken();
		expect(token).toBeDefined();
	});

	it(`should create a session`, async () => {
		const session: Session = await createSession(generateSessionToken(), 'test@test');
		expect(session.id).toBeDefined();
		expect(session.userID).toBeDefined();
		expect(session.expiresAt).toBeDefined();
	});

	it(`should validate a session`, async () => {
		const token = generateSessionToken();
		const session: Session = await createSession(token, 'test@test');
		const svr: SessionValidationResult = await validateSessionToken(token);

		expect(svr.session).toBeDefined();
		expect(svr.user).toBeDefined();

		expect(svr.session?.id).toEqual(session.id);
		expect(svr.session?.userID).toEqual(session.userID);
		expect(svr.session?.expiresAt).toEqual(session.expiresAt);

		expect(svr.user?.auth).toEqual(Auth.ADMIN);
		expect(svr.user?.email).toEqual('test@test');
		expect(svr.user?.id).toBeDefined();
	});

	it(`should invalidate a session`, async () => {
		const token = generateSessionToken();
		const session: Session = await createSession(token, 'test@test');
		await invalidateSession(session.id);
		const svr: SessionValidationResult = await validateSessionToken(token);

		expect(svr.session).toBeNull();
		expect(svr.user).toBeNull();
	});

	it(`should invalidate all sessions`, async () => {
		const token = generateSessionToken();
		await createSession(token, 'test@test');
		await invalidateAllSessions('test@test');
		const svr: SessionValidationResult = await validateSessionToken(token);

		expect(svr.session).toBeNull();
		expect(svr.user).toBeNull();
	});
});

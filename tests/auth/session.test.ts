import { Auth } from '../../src/auth/authorization';
import {
	createSession,
	generateSessionToken,
	invalidateAllSessions,
	invalidateSession,
	Session,
	SessionValidationResult,
	validateSessionToken,
	Errors as SessionErrors,
} from '../../src/auth/session';
import { createUser } from '../../src/db/users/crud-user';
import { User } from '../../src/users/users';
import neo4j, { Driver, Neo4jError } from 'neo4j-driver';

describe(`Sessions tests`, () => {
	beforeAll(async () => {
		await createUser(new User('test@test', Auth.ADMIN, 'test', 'test'), 'test@test');
	});

	beforeEach(async () => {
		jest.restoreAllMocks();
		// invalidateAllSessions('test@test');
	});

	it(`should generate a session token`, () => {
		const token = generateSessionToken();
		expect(token).toBeDefined();
	});

	it(`should create a session`, async () => {
		const session: Session | undefined = await createSession(generateSessionToken(), 'test@test');
		expect(session).toBeDefined();
		expect(session?.id).toBeDefined();
		expect(session?.userID).toBeDefined();
		expect(session?.expiresAt).toBeDefined();
	});

	it(`should throw an error if there was a problem with the server while creating a session`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValue(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(createSession(generateSessionToken(), 'test@test')).rejects.toThrow(SessionErrors.CANNOT_CREATE_SESSION);
	});

	it(`should return undefined if a session could not be created`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockResolvedValue({ records: [] }),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		const session: Session | undefined = await createSession(generateSessionToken(), 'test@test');

		expect(session).toBeUndefined();
	});

	test(`validateSessionToken should return undefined without a token`, async () => {
		const svr = await validateSessionToken(undefined);
		expect(svr.session).toBeNull();
		expect(svr.user).toBeNull();
	});

	it(`should validate a session`, async () => {
		const token = generateSessionToken();
		const session: Session | undefined = await createSession(token, 'test@test');
		const svr: SessionValidationResult = await validateSessionToken(token);

		expect(svr.session).toBeDefined();
		expect(svr.user).toBeDefined();

		expect(svr.session?.id).toEqual(session?.id);
		expect(svr.session?.userID).toEqual(session?.userID);
		expect(svr.session?.expiresAt).toEqual(session?.expiresAt);

		expect(svr.user?.auth).toEqual(Auth.ADMIN);
		expect(svr.user?.email).toEqual('test@test');
		expect(svr.user?.id).toBeDefined();
	});

	test(`validateSessionToken should throw an errro if there was an issue with the server`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValue(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(validateSessionToken('token')).rejects.toThrow(SessionErrors.ERROR_VALIDATING_TOKEN);
	});

	it(`should invalidate a session`, async () => {
		const token = generateSessionToken();
		const session: Session | undefined = await createSession(token, 'test@test');
		await invalidateSession(session?.id as string);
		const svr: SessionValidationResult = await validateSessionToken(token);

		expect(svr.session).toBeNull();
		expect(svr.user).toBeNull();
	});

	test(`invalidateSession should throw an error if there was an issue with the server`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValue(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(invalidateSession('sessionID')).rejects.toThrow(SessionErrors.ERROR_INVALIDATING_SESSSION);
	});

	// it(`should invalidate all sessions`, async () => {
	// 	const token = generateSessionToken();
	// 	await createSession(token, 'test@test');
	// 	await invalidateAllSessions('test@test');
	// 	const svr: SessionValidationResult = await validateSessionToken(token);

	// 	expect(svr.session).toBeNull();
	// 	expect(svr.user).toBeNull();
	// });

	test(`invalidateAllSessions should throw an error if there was an issue with the server`, async () => {
		const driverMock = {
			session: jest.fn().mockReturnValue({
				run: jest.fn().mockRejectedValue(new Neo4jError('', '', '', '')),
				close: jest.fn(),
			} as unknown as Session),
			close: jest.fn(),
			getServerInfo: jest.fn(),
		} as unknown as Driver;

		const driverSpy = jest.spyOn(neo4j, 'driver');
		driverSpy.mockReturnValueOnce(driverMock);

		await expect(invalidateAllSessions('test@test')).rejects.toThrow(SessionErrors.ERROR_INVALIDATING_SESSSION);
	});
});

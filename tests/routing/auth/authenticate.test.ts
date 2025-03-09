import request from 'supertest';
import startServer from '../../../src/server/server';
import { authenticateUri, logoutUri } from '../../../src/routing/uriConfig';
import { FieldError, RoutingErrors } from '../../../src/_helpers/errors-helper';
import { faker } from '@faker-js/faker';
import * as authenticateUser from '../../../src/db/users/authenticate-user';
import * as sessions from '../../../src/auth/session';
import { User } from '../../../src/users/users';
import { Auth } from '../../../src/auth/authorization';

describe(`Authenticate Route Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test(`/authenticate should send 405 status on PUT with Allow header 'POST'`, async () => {
		await request(app)
			.put(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	test(`/authenticate should send 405 status on GET with Allow header 'POST'`, async () => {
		await request(app)
			.get(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	test(`/authenticate should send 405 status on DELETE with Allow header 'POST'`, async () => {
		await request(app)
			.delete(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	test(`/authenticate should send 400 status on POST without password`, async () => {
		await request(app)
			.post(authenticateUri)
			.send({ email: faker.internet.email() })
			.expect(400)
			.then(response => {
				expect(response.body.message).toBe(RoutingErrors.INVALID_REQUEST);
				expect(response.body.data.fields).toContainEqual({ field: 'password', message: FieldError.REQUIRED });
			});
	});

	test(`/authenticate should send 400 status on POST without email`, async () => {
		await request(app)
			.post(authenticateUri)
			.send({ password: faker.internet.password() })
			.expect(400)
			.then(response => {
				expect(response.body.message).toBe(RoutingErrors.INVALID_REQUEST);
				expect(response.body.data.fields).toContainEqual({ field: 'email', message: FieldError.REQUIRED });
			});
	});

	test(`/authenticate should send 401 status with incorrect password`, async () => {
		const checkPasswordSpy = jest.spyOn(authenticateUser, 'checkPassword');
		checkPasswordSpy.mockResolvedValueOnce(undefined);

		await request(app)
			.post(authenticateUri)
			.send({ email: faker.internet.email(), password: faker.internet.password() })
			.expect(401)
			.then(response => {
				expect(response.headers['www-authenticate']).toBe(`xBasic realm="${process.env.AUTH_REALM}"`);
			});
	});

	test(`/authenticate should send 204 status with session cookie using correct password`, async () => {
		const checkPasswordSpy = jest.spyOn(authenticateUser, 'checkPassword');
		checkPasswordSpy.mockResolvedValueOnce(new User(faker.internet.email(), Auth.ADMIN, faker.person.firstName(), faker.person.lastName()));

		const createSessionSpy = jest.spyOn(sessions, 'createSession');
		createSessionSpy.mockResolvedValueOnce({ id: '', userID: '', expiresAt: new Date() });

		await request(app)
			.post(authenticateUri)
			.send({ email: faker.internet.email(), password: faker.internet.password() })
			.expect(204)
			.then(response => {
				expect(response.body).toEqual({});
				expect(response.header['set-cookie']).toBeDefined();
				expect(response.header['set-cookie'][0]).toContain('jwt');
			});
	});

	test(`/logout should send 405 status on PUT with Allow header 'GET'`, async () => {
		await request(app)
			.put(logoutUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('GET');
			});
	});

	test(`/logout should send 405 status on POST with Allow header 'GET'`, async () => {
		await request(app)
			.post(logoutUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('GET');
			});
	});

	test(`/logout should send 405 status on DELETE with Allow header 'GET'`, async () => {
		await request(app)
			.delete(logoutUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('GET');
			});
	});

	test(`/logout should send 200 status if no cookie exists`, async () => {
		await request(app)
			.get(logoutUri)
			.expect(204)
			.then(response => {
				expect(response.body).toEqual({});
				expect(response.header['set-cookie']).toBeUndefined();
			});
	});

	test(`/logout should send 204 status and delete session cookie`, async () => {
		const checkPasswordSpy = jest.spyOn(authenticateUser, 'checkPassword');
		checkPasswordSpy.mockResolvedValueOnce(new User(faker.internet.email(), Auth.ADMIN, faker.person.firstName(), faker.person.lastName()));

		const createSessionSpy = jest.spyOn(sessions, 'createSession');
		createSessionSpy.mockResolvedValueOnce({ id: '', userID: '', expiresAt: new Date() });

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', userID: '', expiresAt: new Date() },
			user: { id: '', email: faker.internet.email(), auth: Auth.ADMIN },
		});

		const invalidateSessionSpy = jest.spyOn(sessions, 'invalidateSession');
		invalidateSessionSpy.mockResolvedValueOnce();

		const agent = request.agent(app);

		await agent
			.post(authenticateUri)
			.send({ email: faker.internet.email(), password: faker.internet.password() })
			.expect(204)
			.then(response => {
				expect(response.body).toEqual({});
				expect(response.header['set-cookie']).toBeDefined();
				expect(response.header['set-cookie'][0]).toContain('jwt');
			});

		await agent
			.get(logoutUri)
			.expect(204)
			.then(response => {
				expect(response.body).toEqual({});
				expect(response.header['set-cookie'][0]).toContain('jwt=;');
			});
	});
});

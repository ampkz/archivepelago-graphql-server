import request from 'supertest';
import startServer from '../../../src/server/server';
import { authenticateUri } from '../../../src/routing/uriConfig';
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

	it(`should send 405 status on PUT with Allow header 'POST'`, async () => {
		await request(app)
			.put(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	it(`should send 405 status on GET with Allow header 'POST'`, async () => {
		await request(app)
			.get(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	it(`should send 405 status on DELETE with Allow header 'POST'`, async () => {
		await request(app)
			.delete(authenticateUri)
			.expect(405)
			.then(response => {
				expect(response.headers.allow).toBe('POST');
			});
	});

	it(`should send 400 status on POST without password`, async () => {
		await request(app)
			.post(authenticateUri)
			.send({ email: faker.internet.email() })
			.expect(400)
			.then(response => {
				expect(response.body.message).toBe(RoutingErrors.INVALID_REQUEST);
				expect(response.body.data.fields).toContainEqual({ field: 'password', message: FieldError.REQUIRED });
			});
	});

	it(`should send 400 status on POST without email`, async () => {
		await request(app)
			.post(authenticateUri)
			.send({ password: faker.internet.password() })
			.expect(400)
			.then(response => {
				expect(response.body.message).toBe(RoutingErrors.INVALID_REQUEST);
				expect(response.body.data.fields).toContainEqual({ field: 'email', message: FieldError.REQUIRED });
			});
	});

	it(`should send 401 status with incorrect password`, async () => {
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

	it(`should send 204 status with session cookie using correct password`, async () => {
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
});

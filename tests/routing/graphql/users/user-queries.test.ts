import request from 'supertest';
import startServer from '../../../../src/server/server';
import { signToken } from '../../../../src/_helpers/auth-helpers';
import { faker } from '@faker-js/faker';
import { Auth, AuthorizedUser } from '../../../../src/auth/authorization';
import * as crudUser from '../../../../src/db/users/crud-user';
import * as sessions from '../../../../src/auth/session';
import { Errors as GraphQLErrors } from '../../../../src/graphql/errors/errors';
import { User } from '../../../../src/users/users';

describe(`User Query Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('user query should throw an unauthorized error if not authenticated', async () => {
		const query = `
        query {
          user(email: "not@email.com") {
            firstName
            lastName
            auth
          }
        }
      `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	test('user query should throw an unauthorized error if authenticated user is a contributor', async () => {
		const query = `
        query {
          user(email: "not@email.com") {
            firstName
            lastName
            auth
          }
        }
      `;

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	test('user query should return user if authenticated user is a contributor and querying self', async () => {
		const email: string = faker.internet.email(),
			user: User = new User(email, Auth.CONTRIBUTOR, faker.person.firstName(), faker.person.lastName(), faker.person.middleName());

		const getUserByEmailSpy = jest.spyOn(crudUser, 'getUserByEmail');
		getUserByEmailSpy.mockResolvedValueOnce(user);

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(user.email, user.auth, ''),
		});

		const token = sessions.generateSessionToken();

		const query = `
        query {
          user(email: "${email}") {
            firstName
            lastName
            secondName
            email
            auth
          }
        }
      `;

		const jwtToken = signToken(email, Auth.CONTRIBUTOR, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		const returnedUser = body.data.user;
		expect(returnedUser.email).toEqual(user.email);
		expect(returnedUser.firstName).toEqual(user.firstName);
		expect(returnedUser.lastName).toEqual(user.lastName);
		expect(returnedUser.secondName).toEqual(user.secondName);
		expect(returnedUser.auth).toEqual(user.auth);
	});

	test('user query should return user if authenticated user is an admin', async () => {
		const email: string = faker.internet.email(),
			user: User = new User(email, Auth.CONTRIBUTOR, faker.person.firstName(), faker.person.lastName(), faker.person.middleName());

		const getUserByEmailSpy = jest.spyOn(crudUser, 'getUserByEmail');
		getUserByEmailSpy.mockResolvedValueOnce(user);

		const query = `
        query {
          user(email: "${email}") {
            firstName
            lastName
            secondName
            email
            auth
          }
        }
      `;
		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		const returnedUser = body.data.user;
		expect(returnedUser.email).toEqual(user.email);
		expect(returnedUser.firstName).toEqual(user.firstName);
		expect(returnedUser.lastName).toEqual(user.lastName);
		expect(returnedUser.secondName).toEqual(user.secondName);
		expect(returnedUser.auth).toEqual(user.auth);
	});

	test('user query should throw an error if no user is found', async () => {
		const getUserByEmailSpy = jest.spyOn(crudUser, 'getUserByEmail');
		getUserByEmailSpy.mockResolvedValueOnce(undefined);

		const query = `
      query {
        user(email: "not@email.com") {
          firstName
          lastName
          auth
        }
      }
    `;

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.NOT_FOUND);
	});
});

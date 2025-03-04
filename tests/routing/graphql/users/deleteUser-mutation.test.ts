import { faker } from '@faker-js/faker';
import startServer from '../../../../src/server/server';
import { Auth, AuthorizedUser } from '../../../../src/auth/authorization';
import request from 'supertest';
import { Errors as GraphQLErrors } from '../../../../src/graphql/errors/errors';
import { signToken } from '../../../../src/_helpers/auth-helpers';
import * as crudUser from '../../../../src/db/users/crud-user';
import * as sessions from '../../../../src/auth/session';
import { User } from '../../../../src/users/users';
import { InternalError } from '../../../../src/_helpers/errors-helper';

describe(`deleteUser Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation DeleteUser($email: String!){
            deleteUser(email: $email) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			email: faker.internet.email(),
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: null,
			user: null,
		});

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should throw an unauthorized error with a contributor`, async () => {
		const query = `
          mutation DeleteUser($email: String!){
            deleteUser(email: $email) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			email: faker.internet.email(),
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should delete a user with admin`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			secondName = faker.person.middleName();

		const user: User = new User(email, auth, firstName, lastName, secondName);

		const deleteUserSpy = jest.spyOn(crudUser, 'deleteUser');
		deleteUserSpy.mockResolvedValueOnce(user);

		const query = `
          mutation DeleteUser($email: String!){
            deleteUser(email: $email) {
              firstName
              lastName
              email
              auth
              secondName
            }
          }
        `;

		const variables = {
			email: faker.internet.email(),
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);
		expect(body.data.deleteUser).toEqual(user);
	});

	it(`should delete a user as contributor and self`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			secondName = faker.person.middleName();

		const user: User = new User(email, auth, firstName, lastName, secondName);

		const deleteUserSpy = jest.spyOn(crudUser, 'deleteUser');
		deleteUserSpy.mockResolvedValueOnce(user);

		const query = `
            mutation DeleteUser($email: String!){
              deleteUser(email: $email) {
                firstName
                lastName
                email
                auth
                secondName
              }
            }
          `;

		const variables = {
			email,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(email, Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(email, Auth.CONTRIBUTOR, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);
		expect(body.data.deleteUser).toEqual(user);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const deleteUserSpy = jest.spyOn(crudUser, 'deleteUser');
		deleteUserSpy.mockRejectedValue(new InternalError(crudUser.Errors.CANNOT_DELETE_USER));

		const query = `
          mutation DeleteUser($email: String!){
            deleteUser(email: $email) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			email: faker.internet.email(),
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

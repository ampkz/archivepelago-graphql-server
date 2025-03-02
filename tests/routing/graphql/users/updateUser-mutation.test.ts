import { faker } from '@faker-js/faker';
import startServer from '../../../../src/server/server';
import { Auth, AuthorizedUser } from '../../../../src/auth/authorization';
import request from 'supertest';
import { Errors as GraphQLErrors } from '../../../../src/graphql/errors/errors';
// import { signToken } from '../../../../src/_helpers/auth-helpers';
import * as crudUser from '../../../../src/db/users/crud-user';
import * as sessions from '../../../../src/auth/session';
import { User } from '../../../../src/users/users';
import { InternalError } from '../../../../src/_helpers/errors-helper';

describe(`updateUser Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: null,
			user: null,
		});

		const variables = {
			input: {
				existingEmail: faker.internet.email(),
				updatedAuth: Auth.CONTRIBUTOR,
				updatedFirstName: faker.person.firstName(),
				updatedLastName: faker.person.lastName(),
				updatedPassword: faker.internet.password(),
				updatedSecondName: faker.person.middleName(),
			},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should throw an unauthorized error with a contributor`, async () => {
		const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			input: {
				existingEmail: faker.internet.email(),
				updatedAuth: Auth.CONTRIBUTOR,
				updatedFirstName: faker.person.firstName(),
				updatedLastName: faker.person.lastName(),
				updatedPassword: faker.internet.password(),
				updatedSecondName: faker.person.middleName(),
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const updateUserSpy = jest.spyOn(crudUser, 'updateUser');
		updateUserSpy.mockRejectedValue(new InternalError(crudUser.Errors.CANNOT_UPDATE_USER));

		const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              secondName
              email
              auth
            }
          }
        `;

		const variables = {
			input: {
				existingEmail: faker.internet.email(),
				updatedAuth: Auth.CONTRIBUTOR,
				updatedFirstName: faker.person.firstName(),
				updatedLastName: faker.person.lastName(),
				updatedPassword: faker.internet.password(),
				updatedSecondName: faker.person.middleName(),
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].message).toEqual(crudUser.Errors.CANNOT_UPDATE_USER);
	});

	it(`should update a user as admin`, async () => {
		const email = faker.internet.email();

		const updatedAuth = Auth.CONTRIBUTOR,
			updatedFirstName = faker.person.firstName(),
			updatedLastName = faker.person.lastName(),
			updatedPassword = faker.internet.password(),
			updatedSecondName = faker.person.middleName();

		const query = `
            mutation UpdateUser($input: UpdateUserInput!){
              updateUser(input: $input) {
                firstName
                lastName
                secondName
                email
                auth
              }
            }
          `;

		const variables = {
			input: {
				existingEmail: email,
				updatedAuth,
				updatedFirstName,
				updatedLastName,
				updatedPassword,
				updatedSecondName,
			},
		};

		const user: User = new User(email, updatedAuth, updatedFirstName, updatedLastName, updatedSecondName);

		const updateUserSpy = jest.spyOn(crudUser, 'updateUser');
		updateUserSpy.mockResolvedValue(user);

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.updateUser).toEqual(user);
	});
});

import { faker } from '@faker-js/faker';
import startServer from '../../../../src/server/server';
import { Auth, AuthorizedUser } from '../../../../src/auth/authorization';
import request from 'supertest';
import { Errors as GraphQLErrors } from '../../../../src/graphql/errors/errors';
import { signToken } from '../../../../src/_helpers/auth-helpers';
import * as crudUser from '../../../../src/db/users/crud-user';
import * as sessions from '../../../../src/auth/session';
import { User } from '../../../../src/users/users';
import { InternalError, ResourceExistsError } from '../../../../src/_helpers/errors-helper';

describe(`createUser Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			input: {
				email: faker.internet.email(),
				auth: Auth.CONTRIBUTOR,
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				password: faker.internet.password(),
				secondName: faker.person.middleName(),
			},
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
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			input: {
				email: faker.internet.email(),
				auth: Auth.CONTRIBUTOR,
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				password: faker.internet.password(),
				secondName: faker.person.middleName(),
			},
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

	it(`should create a user with admin`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			password = faker.internet.password(),
			secondName = faker.person.middleName();

		const user: User = new User(email, auth, firstName, lastName, secondName);

		const createUserSpy = jest.spyOn(crudUser, 'createUser');
		createUserSpy.mockResolvedValueOnce(user);

		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
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
				email,
				auth,
				firstName,
				lastName,
				password,
				secondName,
			},
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
		expect(body.data.createUser).toEqual(user);
	});

	it(`should throw an error if user already exists`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			password = faker.internet.password(),
			secondName = faker.person.middleName();

		const createUserSpy = jest.spyOn(crudUser, 'createUser');
		createUserSpy.mockRejectedValue(new ResourceExistsError(crudUser.Errors.CANNOT_CREATE_USER, { info: crudUser.Errors.USER_ALREADY_EXISTS }));

		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
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
				email,
				auth,
				firstName,
				lastName,
				password,
				secondName,
			},
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

	it(`should throw an error if there was an issue with the server`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			password = faker.internet.password(),
			secondName = faker.person.middleName();

		const createUserSpy = jest.spyOn(crudUser, 'createUser');
		createUserSpy.mockRejectedValue(new InternalError(crudUser.Errors.CANNOT_CREATE_USER));

		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
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
				email,
				auth,
				firstName,
				lastName,
				password,
				secondName,
			},
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

	it(`should throw an error with an invalid email`, async () => {
		const email = 'invalid email',
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			password = faker.internet.password(),
			secondName = faker.person.middleName();

		const user: User = new User(email, auth, firstName, lastName, secondName);

		const createUserSpy = jest.spyOn(crudUser, 'createUser');
		createUserSpy.mockResolvedValueOnce(user);

		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
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
				email,
				auth,
				firstName,
				lastName,
				password,
				secondName,
			},
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
		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.INVALID_EMAIL);
	});

	it(`should throw an error with an invalid auth`, async () => {
		const email = faker.internet.email(),
			auth = Auth.CONTRIBUTOR,
			firstName = faker.person.firstName(),
			lastName = faker.person.lastName(),
			password = faker.internet.password(),
			secondName = faker.person.middleName();

		const user: User = new User(email, auth, firstName, lastName, secondName);

		const createUserSpy = jest.spyOn(crudUser, 'createUser');
		createUserSpy.mockResolvedValueOnce(user);

		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
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
				email,
				auth: 'invalid auth',
				firstName,
				lastName,
				password,
				secondName,
			},
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
		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.INVALID_AUTH);
	});
});

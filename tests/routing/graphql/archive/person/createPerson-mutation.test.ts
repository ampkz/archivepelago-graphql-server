import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import sessions from '@ampkz/auth-neo4j/dist/validate-session-token';
import { generateSessionToken } from '@ampkz/auth-neo4j/dist/sessions/session';
import { Auth } from '@ampkz/auth-neo4j/dist/auth/auth';
import { User } from '@ampkz/auth-neo4j/dist/users/user';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '../../../../../src/_helpers/errors-helper';

describe(`createPerson Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw unauthorized error if trying to create person without authorized user`, async () => {
		const query = `
            mutation CreatePerson($input: CreatePersonInput!) {
                createPerson(input: $input) {
                    id
                }
            }
        `;

		const variables = {
			input: {
				firstName: faker.person.firstName(),
			},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should create a person as an admin`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const createPersonSpy = jest.spyOn(crudPerson, 'createPerson');
		createPersonSpy.mockResolvedValue(new Person({ id }));

		const query = `
            mutation CreatePerson($input: CreatePersonInput!) {
                createPerson(input: $input) {
                    id
                }
            }
        `;

		const variables = {
			input: {
				firstName: faker.person.firstName(),
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createPerson.id).toEqual(id);
	});

	it(`should create a person as a contributor`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const createPersonSpy = jest.spyOn(crudPerson, 'createPerson');
		createPersonSpy.mockResolvedValue(new Person({ id }));

		const query = `
            mutation CreatePerson($input: CreatePersonInput!) {
                createPerson(input: $input) {
                    id
                }
            }
        `;

		const variables = {
			input: {
				firstName: faker.person.firstName(),
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createPerson.id).toEqual(id);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const createPersonSpy = jest.spyOn(crudPerson, 'createPerson');
		createPersonSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation CreatePerson($input: CreatePersonInput!) {
                createPerson(input: $input) {
                    id
                }
            }
        `;

		const variables = {
			input: {
				firstName: faker.person.firstName(),
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

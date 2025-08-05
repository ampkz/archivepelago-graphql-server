import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import sessions from '@ampkz/auth-neo4j/token';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { User } from '@ampkz/auth-neo4j/user';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '@ampkz/auth-neo4j/errors';

describe(`deletePerson Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw unauthorized error if trying to delete person without authorized user`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `;

		const variables = {
			id,
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should delete a person as an admin`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const deletePersonSpy = jest.spyOn(crudPerson, 'deletePerson');
		deletePersonSpy.mockResolvedValue(new Person({ id }));

		const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `;

		const variables = {
			id,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.deletePerson.id).toEqual(id);
	});

	it(`should delete a person as a contributor`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const deletePersonSpy = jest.spyOn(crudPerson, 'deletePerson');
		deletePersonSpy.mockResolvedValue(new Person({ id }));

		const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `;

		const variables = {
			id,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.deletePerson.id).toEqual(id);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const deletePersonSpy = jest.spyOn(crudPerson, 'deletePerson');
		deletePersonSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `;

		const variables = {
			id,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

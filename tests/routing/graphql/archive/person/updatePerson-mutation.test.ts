import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import sessions from '@ampkz/auth-neo4j/token';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { User } from '@ampkz/auth-neo4j/user';

describe(`Update Person Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw unauthorized error if trying to update person without authorized user`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                }
            }
        `;

		const variables = {
			input: {
				id,
				updatedFirstName: faker.person.firstName(),
			},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should update a person as an admin`, async () => {
		const id: string = faker.database.mongodbObjectId(),
			updatedFirstName: string = faker.person.firstName();

		const updatePersonSpy = jest.spyOn(crudPerson, 'updatePerson');
		updatePersonSpy.mockResolvedValue(new Person({ id, firstName: updatedFirstName }));

		const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `;

		const variables = {
			input: {
				id,
				updatedFirstName,
			},
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

		expect(body.data.updatePerson.id).toEqual(id);
		expect(body.data.updatePerson.firstName).toEqual(updatedFirstName);
	});

	it(`should return undefined if no person exists`, async () => {
		const id: string = faker.database.mongodbObjectId(),
			updatedFirstName: string = faker.person.firstName();

		const updatePersonSpy = jest.spyOn(crudPerson, 'updatePerson');
		updatePersonSpy.mockResolvedValue(undefined);

		const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `;

		const variables = {
			input: {
				id,
				updatedFirstName,
			},
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

		expect(body.data.updatePerson).toBeNull();
	});

	it(`should update a person as a contributor`, async () => {
		const id: string = faker.database.mongodbObjectId(),
			updatedFirstName: string = faker.person.firstName();

		const updatePersonSpy = jest.spyOn(crudPerson, 'updatePerson');
		updatePersonSpy.mockResolvedValue(new Person({ id, firstName: updatedFirstName }));

		const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `;

		const variables = {
			input: {
				id,
				updatedFirstName,
			},
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

		expect(body.data.updatePerson.id).toEqual(id);
		expect(body.data.updatePerson.firstName).toEqual(updatedFirstName);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const id: string = faker.database.mongodbObjectId(),
			updatedFirstName: string = faker.person.firstName();

		const updatePersonSpy = jest.spyOn(crudPerson, 'updatePerson');
		updatePersonSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `;

		const variables = {
			input: {
				id,
				updatedFirstName,
			},
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

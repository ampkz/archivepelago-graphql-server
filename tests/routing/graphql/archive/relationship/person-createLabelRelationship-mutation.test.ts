import { faker } from '@faker-js/faker';
import startServer from '../../../../../src/server/server';
import request from 'supertest';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Person } from '../../../../../src/archive/person';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import sessions from '@ampkz/auth-neo4j/token';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { User } from '@ampkz/auth-neo4j/user';

describe(`createLabelRelationship Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
              firstName
            }
          }
        `;

		const variables = {
			personID: faker.database.mongodbObjectId(),
			labelName: `${(global as any).UniqueAdjIterator.next().value}`,
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should create a label relationship with admin`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

		const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'createPersonLabel');
		createPersonRelationshipSpy.mockResolvedValueOnce(person);

		const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
                id
                firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
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

		expect(body.data.createLabelRelationship).toEqual(person);
	});

	it(`should create a label relationship with contributor`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

		const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'createPersonLabel');
		createPersonRelationshipSpy.mockResolvedValueOnce(person);

		const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
                id
                firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
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

		expect(body.data.createLabelRelationship).toEqual(person);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'createPersonLabel');
		createPersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
              firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
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

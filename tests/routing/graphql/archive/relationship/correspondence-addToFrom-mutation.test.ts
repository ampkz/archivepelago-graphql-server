import { faker } from '@faker-js/faker';
import startServer from '../../../../../src/server/server';
import request from 'supertest';
import * as personCorrespondence from '../../../../../src/db/archive/relationship/person-correspondence-relationship';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import sessions from '@ampkz/auth-neo4j/token';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { User } from '@ampkz/auth-neo4j/user';

describe(`addSent and addReceived Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	test(`addReceived should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation AddReceived($correspondenceID: ID!, $receivedID: ID!){
            addReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
              correspondenceID
            }
          }
        `;

		const variables = {
			correspondenceID: faker.database.mongodbObjectId(),
			receivedID: faker.database.mongodbObjectId(),
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	test(`addSent should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation AddSent($correspondenceID: ID!, $sentID: ID!){
            addSent(correspondenceID: $correspondenceID, sentID: $sentID) {
              correspondenceID
            }
          }
        `;

		const variables = {
			correspondenceID: faker.database.mongodbObjectId(),
			sentID: faker.database.mongodbObjectId(),
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	test(`addReceived should create a received relationship with admin`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
          mutation AddReceived($correspondenceID: ID!, $receivedID: ID!){
            addReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
              correspondenceID
              correspondenceType
            }
          }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.addReceived).toEqual(correspondence);
	});

	test(`addSent should create a received relationship with contributor`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
                mutation AddSent($correspondenceID: ID!, $sentID: ID!){
                addSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                    correspondenceID
                    correspondenceType
                }
                }
            `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.addSent).toEqual(correspondence);
	});

	test(`addReceived should create a received relationship with admin`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
              mutation AddReceived($correspondenceID: ID!, $receivedID: ID!){
                addReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                  correspondenceID
                  correspondenceType
                }
              }
            `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.addReceived).toEqual(correspondence);
	});

	test(`addSent should create a received relationship with contributor`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
                    mutation AddSent($correspondenceID: ID!, $sentID: ID!){
                    addSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                        correspondenceID
                        correspondenceType
                    }
                    }
                `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.addSent).toEqual(correspondence);
	});

	test(`addSent should throw an error if there was an issue with the server`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation AddSent($correspondenceID: ID!, $sentID: ID!){
            addSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                correspondenceID
                correspondenceType
            }
            }
        `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
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

	test(`addSent should return null if no correspondence relationship was created`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValue(null);

		const query = `
            mutation AddSent($correspondenceID: ID!, $sentID: ID!){
            addSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                correspondenceID
                correspondenceType
            }
            }
        `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.addSent).toBeUndefined();
	});

	test(`addReceived should throw an error if there was an issue with the server`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation AddReceived($correspondenceID: ID!, $receivedID: ID!){
                addReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                    correspondenceID
                    correspondenceType
                }
            }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
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

	test(`addReceived should return null if no relationship was created`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const createPersonRelationshipSpy = jest.spyOn(personCorrespondence, 'createPersonRelationship');
		createPersonRelationshipSpy.mockResolvedValue(null);

		const query = `
            mutation AddReceived($correspondenceID: ID!, $receivedID: ID!){
                addReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                    correspondenceID
                    correspondenceType
                }
            }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '', host: '', userAgent: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = sessions.generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.addReceived).toBeUndefined();
	});
});

import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import * as crudCorrespondence from '../../../../../src/db/archive/crud-correspondence';
import sessions from '@ampkz/auth-neo4j/token';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import { Auth } from '@ampkz/auth-neo4j/auth';
import { User } from '@ampkz/auth-neo4j/user';

describe(`Correspondence Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error without authorization`, async () => {
		const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			correspondenceID: faker.database.mongodbObjectId(),
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should delete a correspondence as admin`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'deleteCorrespondence');
		deleteCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER }));

		const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			correspondenceID,
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

		expect(body.data.deleteCorrespondence.correspondenceID).toEqual(correspondenceID);
	});

	it(`should delete a correspondence as contributor`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'deleteCorrespondence');
		deleteCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER }));

		const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			correspondenceID,
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

		expect(body.data.deleteCorrespondence.correspondenceID).toEqual(correspondenceID);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'deleteCorrespondence');
		deleteCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.MUTATION_FAILED));

		const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			correspondenceID,
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

	it(`should return undefined if no correspondence was deleted`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'deleteCorrespondence');
		deleteCorrespondenceSpy.mockResolvedValue(undefined);

		const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			correspondenceID,
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

		expect(body.deleteCorrespondence).toBeUndefined();
	});
});

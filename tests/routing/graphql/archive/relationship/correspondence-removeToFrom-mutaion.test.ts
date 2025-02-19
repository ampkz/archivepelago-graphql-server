import { faker } from '@faker-js/faker';
import startServer from '../../../../../src/server/server';
import request from 'supertest';
import dotenv from 'dotenv';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import * as personCorrespondence from '../../../../../src/db/archive/relationship/person-correspondence-relationship';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Auth } from '../../../../../src/auth/authorization';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';

dotenv.config();

describe(`removeReceived and removeSent Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	test(`removeReceived should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation RemoveReceived($correspondenceID: ID!, $receivedID: ID!){
            removeReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
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

	test(`removeSent should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation RemoveSent($correspondenceID: ID!, $sentID: ID!){
            removeSent(correspondenceID: $correspondenceID, sentID: $sentID) {
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

	test(`removeReceived should delete a received relationship with admin`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
          mutation RemoveReceived($correspondenceID: ID!, $receivedID: ID!){
            removeReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
              correspondenceID
              correspondenceType
            }
          }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.removeReceived).toEqual(correspondence);
	});

	test(`removeSent should delete a received relationship with contributor`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
                mutation RemoveSent($correspondenceID: ID!, $sentID: ID!){
                removeSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                    correspondenceID
                    correspondenceType
                }
                }
            `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.removeSent).toEqual(correspondence);
	});

	test(`removeReceived should delete a received relationship with admin`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
              mutation RemoveReceived($correspondenceID: ID!, $receivedID: ID!){
                removeReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                  correspondenceID
                  correspondenceType
                }
              }
            `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.removeReceived).toEqual(correspondence);
	});

	test(`removeSent should delete a received relationship with contributor`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const correspondence = new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER });

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValueOnce(correspondence);

		const query = `
                    mutation RemoveSent($correspondenceID: ID!, $sentID: ID!){
                    removeSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                        correspondenceID
                        correspondenceType
                    }
                    }
                `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.removeSent).toEqual(correspondence);
	});

	test(`removeSent should throw an error if there was an issue with the server`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation RemoveSent($correspondenceID: ID!, $sentID: ID!){
            removeSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                correspondenceID
                correspondenceType
            }
            }
        `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});

	test(`removeSent should return undefined if no relationship was deleted`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			sentID = faker.database.mongodbObjectId();

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValue(undefined);

		const query = `
            mutation RemoveSent($correspondenceID: ID!, $sentID: ID!){
            removeSent(correspondenceID: $correspondenceID, sentID: $sentID) {
                correspondenceID
                correspondenceType
            }
            }
        `;

		const variables = {
			correspondenceID,
			sentID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.removeSent).toBeUndefined();
	});

	test(`removeReceived should throw an error if there was an issue with the server`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation RemoveReceived($correspondenceID: ID!, $receivedID: ID!){
                removeReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                    correspondenceID
                    correspondenceType
                }
            }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});

	test(`removeReceived should return undefined if no relationship was removed`, async () => {
		const correspondenceID = faker.database.mongodbObjectId(),
			receivedID = faker.database.mongodbObjectId();

		const deletePersonRelationshipSpy = jest.spyOn(personCorrespondence, 'deletePersonRelationship');
		deletePersonRelationshipSpy.mockResolvedValue(undefined);

		const query = `
            mutation RemoveReceived($correspondenceID: ID!, $receivedID: ID!){
                removeReceived(correspondenceID: $correspondenceID, receivedID: $receivedID) {
                    correspondenceID
                    correspondenceType
                }
            }
        `;

		const variables = {
			correspondenceID,
			receivedID,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.removeReceived).toBeUndefined();
	});
});

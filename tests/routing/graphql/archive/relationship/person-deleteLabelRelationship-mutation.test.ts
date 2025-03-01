import { faker } from '@faker-js/faker';
import startServer from '../../../../../src/server/server';
import request from 'supertest';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Person } from '../../../../../src/archive/person';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Auth } from '../../../../../src/auth/authorization';

describe(`deleteLabelRelationship Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it(`should throw an unauthorized error with no authorized user`, async () => {
		const query = `
          mutation DeleteLabelRelationship($personID: ID!, $labelName: ID!){
            deleteLabelRelationship(personID: $personID, labelName: $labelName) {
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

	it(`should delete a label relationship with admin`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

		const deletePersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'deletePersonLabel');
		deletePersonRelationshipSpy.mockResolvedValueOnce(person);

		const query = `
          mutation DeleteLabelRelationship($personID: ID!, $labelName: ID!){
            deleteLabelRelationship(personID: $personID, labelName: $labelName) {
              id
              firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.deleteLabelRelationship).toEqual(person);
	});

	it(`should delete a label relationship with contributor`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

		const deletePersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'deletePersonLabel');
		deletePersonRelationshipSpy.mockResolvedValueOnce(person);

		const query = `
          mutation DeleteLabelRelationship($personID: ID!, $labelName: ID!){
            deleteLabelRelationship(personID: $personID, labelName: $labelName) {
              id
              firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.deleteLabelRelationship).toEqual(person);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const personID = faker.database.mongodbObjectId(),
			labelName = `${(global as any).UniqueAdjIterator.next().value}`;

		const deletePersonRelationshipSpy = jest.spyOn(personLabelRelationship, 'deletePersonLabel');
		deletePersonRelationshipSpy.mockRejectedValue(new InternalError(''));

		const query = `
          mutation DeleteLabelRelationship($personID: ID!, $labelName: ID!){
            deleteLabelRelationship(personID: $personID, labelName: $labelName) {
              firstName
            }
          }
        `;

		const variables = {
			personID,
			labelName,
		};

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

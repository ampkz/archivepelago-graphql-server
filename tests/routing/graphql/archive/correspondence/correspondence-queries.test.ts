import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudCorrespondence from '../../../../../src/db/archive/crud-correspondence';
import * as correspondencePerson from '../../../../../src/db/archive/relationship/person-correspondence-relationship';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import { Person } from '../../../../../src/archive/person';

dotenv.config();

describe(`Correspondence Query Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should return a created correspondence`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'getCorrespondence');
		getCorrespondenceSpy.mockResolvedValue(
			new Correspondence({
				correspondenceID,
				correspondenceDate: faker.date.anytime().toDateString(),
				correspondenceType: CorrespondenceType.LETTER,
			})
		);

		const query = `
            query {
                correspondence(correspondenceID: "${correspondenceID}") {
                    correspondenceID
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.correspondence.correspondenceID).toEqual(correspondenceID);
	});

	it(`should throw and error if there was an issue getting a correspondence`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'getCorrespondence');
		getCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                correspondence(correspondenceID: "${correspondenceID}") {
                    correspondenceID
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
	});

	it(`should return undefined if no correspondence was found`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId();

		const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'getCorrespondence');
		getCorrespondenceSpy.mockResolvedValue(undefined);

		const query = `
            query {
                correspondence(correspondenceID: "${correspondenceID}") {
                    correspondenceID
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.correspondence).toBeUndefined();
	});

	it(`should retrieve a list of to persons`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId(),
			firstName = faker.person.firstName();

		const person = new Person({ id: faker.database.mongodbObjectId(), firstName });

		const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'getCorrespondence');
		getCorrespondenceSpy.mockResolvedValue(
			new Correspondence({
				correspondenceID,
				correspondenceDate: faker.date.anytime().toDateString(),
				correspondenceType: CorrespondenceType.LETTER,
			})
		);

		const getPersonSpy = jest.spyOn(correspondencePerson, 'getPersonsByCorrespondence');
		getPersonSpy.mockResolvedValue([person]);

		const query = `
            query {
                correspondence(correspondenceID: "${correspondenceID}") {
                    to {
                        id
                        firstName
                    }
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.correspondence.to).toContainEqual(person);
	});

	it(`should retrieve a list of from persons`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId(),
			firstName = faker.person.firstName();

		const person = new Person({ id: faker.database.mongodbObjectId(), firstName });

		const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'getCorrespondence');
		getCorrespondenceSpy.mockResolvedValue(
			new Correspondence({
				correspondenceID,
				correspondenceDate: faker.date.anytime().toDateString(),
				correspondenceType: CorrespondenceType.LETTER,
			})
		);

		const getPersonSpy = jest.spyOn(correspondencePerson, 'getPersonsByCorrespondence');
		getPersonSpy.mockResolvedValue([person]);

		const query = `
            query {
                correspondence(correspondenceID: "${correspondenceID}") {
                    from {
                        id
                        firstName
                    }
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.correspondence.from).toContainEqual(person);
	});

	it(`should retrieve a list of correspondences`, async () => {
		const correspondence1 = new Correspondence({
			correspondenceID: faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType.LETTER,
		});
		const correspondence2 = new Correspondence({
			correspondenceID: faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType.LETTER,
		});

		const getCorrespondencesSpy = jest.spyOn(crudCorrespondence, 'getCorrespondences');
		getCorrespondencesSpy.mockResolvedValue([correspondence1, correspondence2]);

		const query = `
            query {
                correspondences{
                    correspondenceID
                    correspondenceType
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.correspondences).toContainEqual(correspondence1);
		expect(body.data.correspondences).toContainEqual(correspondence2);
	});

	test(`correspondences should throw an error if there is an issue with the server`, async () => {
		const getCorrespondencesSpy = jest.spyOn(crudCorrespondence, 'getCorrespondences');
		getCorrespondencesSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                correspondences{
                    correspondenceID
                    correspondenceType
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].message).toEqual(GraphQLErrors.SERVER_ERROR);
	});
});

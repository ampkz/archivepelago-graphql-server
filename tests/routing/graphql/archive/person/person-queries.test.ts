import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { Label } from '../../../../../src/archive/label';
import { LabelType } from '../../../../../src/generated/graphql';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import * as personCorrespondence from '../../../../../src/db/archive/relationship/person-correspondence-relationship';

describe(`Person Query Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it(`should return a created person`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const getPersonSpy = jest.spyOn(crudPerson, 'getPerson');
		getPersonSpy.mockResolvedValue(new Person({ id }));

		const query = `
            query {
                person(id: "${id}") {
                    id
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.person.id).toEqual(id);
	});

	it(`should return null if no person exists`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const createUserSpy = jest.spyOn(crudPerson, 'getPerson');
		createUserSpy.mockResolvedValue(null);

		const query = `
            query {
                person(id: "${id}") {
                    id
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.person).toBeNull();
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const createUserSpy = jest.spyOn(crudPerson, 'getPerson');
		createUserSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                person(id: "${id}") {
                    id
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
	});

	it(`should return a list of associated labels of a person`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const label: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });
		const label2: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });

		const getPersonSpy = jest.spyOn(crudPerson, 'getPerson');
		getPersonSpy.mockResolvedValue(new Person({ id }));

		const getLabelsByPersonSpy = jest.spyOn(personLabelRelationship, 'getLabelsByPerson');
		getLabelsByPersonSpy.mockResolvedValue([label, label2]);

		const query = `
            query {
                person(id: "${id}") {
                    id
                    labels{
                        name
                        type
                    }
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.person.labels).toContainEqual(label);
		expect(body.data.person.labels).toContainEqual(label2);
	});

	it(`should return a list of associated sent correspondences of a person`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const correspondence: Correspondence = new Correspondence({
			correspondenceID: faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType.LETTER,
		});

		const getPersonSpy = jest.spyOn(crudPerson, 'getPerson');
		getPersonSpy.mockResolvedValue(new Person({ id }));

		const getCorrespondencesByPersonSpy = jest.spyOn(personCorrespondence, 'getCorrespondencesByPerson');
		getCorrespondencesByPersonSpy.mockResolvedValue([correspondence]);

		const query = `
            query {
                person(id: "${id}") {
                    id
                    sentCorrespondences{
                        correspondenceID
                        correspondenceType
                    }
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.person.sentCorrespondences).toContainEqual(correspondence);
	});

	it(`should return a list of associated received correspondences of a person`, async () => {
		const id: string = faker.database.mongodbObjectId();

		const correspondence: Correspondence = new Correspondence({
			correspondenceID: faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType.LETTER,
		});

		const getPersonSpy = jest.spyOn(crudPerson, 'getPerson');
		getPersonSpy.mockResolvedValue(new Person({ id }));

		const getCorrespondencesByPersonSpy = jest.spyOn(personCorrespondence, 'getCorrespondencesByPerson');
		getCorrespondencesByPersonSpy.mockResolvedValue([correspondence]);

		const query = `
            query {
                person(id: "${id}") {
                    id
                    receivedCorrespondences{
                        correspondenceID
                        correspondenceType
                    }
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.person.receivedCorrespondences).toContainEqual(correspondence);
	});

	it(`should return a list of created persons`, async () => {
		const person: Person = new Person({ id: faker.database.mongodbObjectId() });
		const person2: Person = new Person({ id: faker.database.mongodbObjectId() });
		const person3: Person = new Person({ id: faker.database.mongodbObjectId() });

		const getPersonSpy = jest.spyOn(crudPerson, 'getPersons');
		getPersonSpy.mockResolvedValue([person, person2, person3]);

		const query = `
            query {
                persons {
                    id
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.persons).toContainEqual(person);
		expect(body.data.persons).toContainEqual(person2);
		expect(body.data.persons).toContainEqual(person3);
	});

	test(`getPersons should throw an error if there was an issue with the server`, async () => {
		const createUserSpy = jest.spyOn(crudPerson, 'getPersons');
		createUserSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                persons {
                    id
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
	});
});

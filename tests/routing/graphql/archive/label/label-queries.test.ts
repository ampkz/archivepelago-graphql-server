import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import * as crudLabel from '../../../../../src/db/archive/crud-label';
import { InternalError } from '@ampkz/auth-neo4j/errors';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Label } from '../../../../../src/archive/label';
import { LabelType } from '../../../../../src/generated/graphql';
import { Person } from '../../../../../src/archive/person';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';

describe(`Label Query Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it(`should return a created label`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const getLabelSpy = jest.spyOn(crudLabel, 'getLabel');
		getLabelSpy.mockResolvedValue(new Label({ name, type: LabelType.Profession }));

		const query = `
            query {
                label(name: "${name}") {
                    name
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.label.name).toEqual(name);
	});

	it(`should return null if no label exists`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const getLabelSpy = jest.spyOn(crudLabel, 'getLabel');
		getLabelSpy.mockResolvedValue(null);

		const query = `
            query {
                label(name: "${name}") {
                    name
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.label).toBeNull();
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const getLabelSpy = jest.spyOn(crudLabel, 'getLabel');
		getLabelSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                label(name: "${name}") {
                    name
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
	});

	it(`should return a list of associated persons of label`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const person: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });
		const person2: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName() });

		const getLabelSpy = jest.spyOn(crudLabel, 'getLabel');
		getLabelSpy.mockResolvedValue({ name, type: LabelType.Profession });

		const getPersonsByLabelSpy = jest.spyOn(personLabelRelationship, 'getPersonsByLabel');
		getPersonsByLabelSpy.mockResolvedValue([person, person2]);

		const query = `
            query {
                label(name: "${name}") {
                    name
                    persons {
                        id
                        firstName
                    }
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.label.persons).toContainEqual(person);
		expect(body.data.label.persons).toContainEqual(person2);
	});

	it(`should return a list of created labels`, async () => {
		const label: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });
		const label2: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });
		const label3: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });

		const getLabelsSpy = jest.spyOn(crudLabel, 'getLabels');
		getLabelsSpy.mockResolvedValue([label, label2, label3]);

		const query = `
            query {
                labels {
                    name
                    type
                }
            }
        `;
		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.data.labels).toContainEqual(label);
		expect(body.data.labels).toContainEqual(label2);
		expect(body.data.labels).toContainEqual(label3);
	});

	test(`getLabels should throw an error if there was an issue with the server`, async () => {
		const getLabelSpy = jest.spyOn(crudLabel, 'getLabels');
		getLabelSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));

		const query = `
            query {
                labels {
                    name
                    type
                }
            }
        `;

		const { body } = await request(app).post('/graphql').send({ query }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
	});
});

import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { Person } from '../../../../../src/archive/person';
import { Label } from '../../../../../src/archive/label';
import { LabelType } from '../../../../../src/generated/graphql';

describe(`Person Labels Query Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it(`should return a list of labels on person query`, async () => {
		const id: string = faker.string.uuid();

		const getPersonSpy = jest.spyOn(crudPerson, 'getPerson');
		getPersonSpy.mockResolvedValue(new Person({ id }));

		const label: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });
		const label2: Label = new Label({ name: `${(global as any).UniqueAdjIterator.next().value}`, type: LabelType.Profession });

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
});

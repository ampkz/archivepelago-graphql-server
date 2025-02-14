import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudLabel from '../../../../../src/db/archive/crud-label';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Label } from '../../../../../src/archive/label';
import { Person } from '../../../../../src/archive/person';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';

dotenv.config();

describe(`Label Query Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should return a created label`, async () => {
        const name: string = faker.word.adjective();

        const getLabelSpy = jest.spyOn(crudLabel, "getLabel");
        getLabelSpy.mockResolvedValue(new Label(name));
        
        const query = `
            query {
                label(name: "${ name }") {
                    name
                }
            }
        `
        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.label.name).toEqual(name);
    });

    it(`should return undefined if no label exists`, async () => {
        const name: string = faker.word.adjective();

        const getLabelSpy = jest.spyOn(crudLabel, "getLabel");
        getLabelSpy.mockResolvedValue(undefined);
        
        const query = `
            query {
                label(name: "${ name }") {
                    name
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.label).toBeNull();
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const name: string = faker.word.adjective();

        const getLabelSpy = jest.spyOn(crudLabel, "getLabel");
        getLabelSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));
        
        const query = `
            query {
                label(name: "${ name }") {
                    name
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
    });

    it(`should return a list of associated persons of label`, async () => {
        const name: string = faker.word.adjective();

        const person: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName()});
        const person2: Person = new Person({ id: faker.database.mongodbObjectId(), firstName: faker.person.firstName()});

        const getLabelSpy = jest.spyOn(crudLabel, "getLabel");
        getLabelSpy.mockResolvedValue(new Label(name));
        
        const getPersonsByLabelSpy = jest.spyOn(personLabelRelationship, "getPersonsByLabel");
        getPersonsByLabelSpy.mockResolvedValue([person, person2])

        const query = `
            query {
                label(name: "${ name }") {
                    name
                    persons {
                        id
                        firstName
                    }
                }
            }
        `
        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');
        
        expect(body.data.label.persons).toContainEqual(person);
        expect(body.data.label.persons).toContainEqual(person2);
    });
});
import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { Label } from '../../../../../src/archive/label';

dotenv.config();

describe(`Person Query Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should return a created person`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const getPersonSpy = jest.spyOn(crudPerson, "getPerson");
        getPersonSpy.mockResolvedValue(new Person({ id }));
        
        const query = `
            query {
                person(id: "${ id }") {
                    id
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.person.id).toEqual(id);
    });

    it(`should return undefined if no person exists`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const createUserSpy = jest.spyOn(crudPerson, "getPerson");
        createUserSpy.mockResolvedValue(undefined);
        
        const query = `
            query {
                person(id: "${ id }") {
                    id
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.person).toBeNull();
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const createUserSpy = jest.spyOn(crudPerson, "getPerson");
        createUserSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));
        
        const query = `
            query {
                person(id: "${ id }") {
                    id
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
    });

    it(`should return a list of associated labels of a person`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const label: Label = new Label(faker.word.adjective());
        const label2: Label = new Label(faker.word.adjective());

        const getPersonSpy = jest.spyOn(crudPerson, "getPerson");
        getPersonSpy.mockResolvedValue(new Person({ id }));

        const getLabelsByPersonSpy = jest.spyOn(personLabelRelationship, "getLabelsByPerson");
        getLabelsByPersonSpy.mockResolvedValue([label, label2]);
        
        const query = `
            query {
                person(id: "${ id }") {
                    id
                    labels{
                        name
                    }
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.person.labels).toContainEqual(label);
        expect(body.data.person.labels).toContainEqual(label2);
    });

    it(`should return a list of created persons`, async () => {
        const person: Person = new Person({ id: faker.database.mongodbObjectId() });
        const person2: Person = new Person({ id: faker.database.mongodbObjectId() });
        const person3: Person = new Person({ id: faker.database.mongodbObjectId() });        

        const getPersonSpy = jest.spyOn(crudPerson, "getPersons");
        getPersonSpy.mockResolvedValue([person, person2, person3]);
        
        const query = `
            query {
                persons {
                    id
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.persons).toContainEqual(person);
        expect(body.data.persons).toContainEqual(person2);
        expect(body.data.persons).toContainEqual(person3);
    });

    test(`getPersons should throw an error if there was an issue with the server`, async () => {
        const createUserSpy = jest.spyOn(crudPerson, "getPersons");
        createUserSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));
        
        const query = `
            query {
                persons {
                    id
                }
            }
        `

        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.SERVER_ERROR);
    });
});
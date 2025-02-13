import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';

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
});
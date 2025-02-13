import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudPerson from '../../../../../src/db/archive/crud-person';
import { Person } from '../../../../../src/archive/person';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import { Auth } from '../../../../../src/auth/authorization';
import { InternalError } from '../../../../../src/_helpers/errors-helper';

dotenv.config();

describe(`Delete Person Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw unauthorized error if trying to delete person without authorized user`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `

        const variables = {
            id
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should delete a person as an admin`, async () => {
        const id: string = faker.database.mongodbObjectId();
        
        const deletePersonSpy = jest.spyOn(crudPerson, "deletePerson");
        deletePersonSpy.mockResolvedValue(new Person({ id }));

        const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `

        const variables = {
            id
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.deletePerson.id).toEqual(id);
    });

    it(`should delete a person as a contributor`, async () => {
        const id: string = faker.database.mongodbObjectId();
        
        const deletePersonSpy = jest.spyOn(crudPerson, "deletePerson");
        deletePersonSpy.mockResolvedValue(new Person({ id }));

        const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `

        const variables = {
            id
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.deletePerson.id).toEqual(id);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const id: string = faker.database.mongodbObjectId();
        
        const deletePersonSpy = jest.spyOn(crudPerson, "deletePerson");
        deletePersonSpy.mockRejectedValue(new InternalError(''));

        const query = `
            mutation DeletePerson($id: ID!) {
                deletePerson(id: $id) {
                    id
                }
            }
        `

        const variables = {
            id
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
    });
});
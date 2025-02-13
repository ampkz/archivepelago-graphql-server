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

describe(`Update Person Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw unauthorized error if trying to update person without authorized user`, async () => {
        const id: string = faker.database.mongodbObjectId();

        const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                }
            }
        `

        const variables = {
            input: {
                id,
                updatedFirstName: faker.person.firstName()
            }
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should update a person as an admin`, async () => {
        const id: string = faker.database.mongodbObjectId(),
            firstName: string = faker.person.firstName(),
            updatedFirstName: string = faker.person.firstName();
        
        const updatePersonSpy = jest.spyOn(crudPerson, "updatePerson");
        updatePersonSpy.mockResolvedValue(new Person({ id, firstName: updatedFirstName }));

        const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `

        const variables = {
            input: {
                id,
                updatedFirstName
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.updatePerson.id).toEqual(id);
        expect(body.data.updatePerson.firstName).toEqual(updatedFirstName);
    });

    it(`should return undefined if no person exists`, async () => {
        const id: string = faker.database.mongodbObjectId(),
            firstName: string = faker.person.firstName(),
            updatedFirstName: string = faker.person.firstName();
        
        const updatePersonSpy = jest.spyOn(crudPerson, "updatePerson");
        updatePersonSpy.mockResolvedValue(undefined);

        const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `

        const variables = {
            input: {
                id,
                updatedFirstName
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.updatePerson).toBeNull();
    });

    it(`should update a person as a contributor`, async () => {
        const id: string = faker.database.mongodbObjectId(),
            firstName: string = faker.person.firstName(),
            updatedFirstName: string = faker.person.firstName();
        
        const updatePersonSpy = jest.spyOn(crudPerson, "updatePerson");
        updatePersonSpy.mockResolvedValue(new Person({ id, firstName: updatedFirstName }));

        const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `

        const variables = {
            input: {
                id,
                updatedFirstName
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.updatePerson.id).toEqual(id);
        expect(body.data.updatePerson.firstName).toEqual(updatedFirstName);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const id: string = faker.database.mongodbObjectId(),
            updatedFirstName: string = faker.person.firstName();
        
        const updatePersonSpy = jest.spyOn(crudPerson, "updatePerson");
        updatePersonSpy.mockRejectedValue(new InternalError(''));

        const query = `
            mutation UpdatePerson($input: UpdatePersonInput!) {
                updatePerson(input: $input) {
                    id
                    firstName
                }
            }
        `

        const variables = {
            input: {
                id,
                updatedFirstName
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
    });
});
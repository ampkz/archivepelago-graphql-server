import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudCorrespondence from '../../../../../src/db/archive/crud-correspondence';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import { Auth } from '../../../../../src/auth/authorization';

dotenv.config();

describe(`createCorrespondence Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw an unauthorized error without authorization`, async () => {
        const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `

        const variables = {
            input: {
                toID: faker.database.mongodbObjectId()
            }
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should create a correspondence as admin`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId(),
            toID: string = faker.database.mongodbObjectId();
        
        const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, "createCorrespondence");
        createCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, toID }));

        const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `

        const variables = {
            input: {
                toID: faker.database.mongodbObjectId()
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
                .post('/graphql')
                .send({ query, variables })
                .set('Accept', 'application/json')
                .set('Cookie', [`jwt=${jwtToken}`]);
    
            expect(body.data.createCorrespondence.correspondenceID).toEqual(correspondenceID);
    });

    it(`should create a correspondence as contributor`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId(),
            toID: string = faker.database.mongodbObjectId();
        
        const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, "createCorrespondence");
        createCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, toID }));

        const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `

        const variables = {
            input: {
                toID: faker.database.mongodbObjectId()
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
                .post('/graphql')
                .send({ query, variables })
                .set('Accept', 'application/json')
                .set('Cookie', [`jwt=${jwtToken}`]);
    
            expect(body.data.createCorrespondence.correspondenceID).toEqual(correspondenceID);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId(),
            toID: string = faker.database.mongodbObjectId();
        
        const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, "createCorrespondence");
        createCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.MUTATION_FAILED));

        const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `

        const variables = {
            input: {
                toID: faker.database.mongodbObjectId()
            }
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
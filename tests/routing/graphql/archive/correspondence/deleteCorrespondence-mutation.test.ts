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

describe(`Correspondence Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw an unauthorized error without authorization`, async () => {
        const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `

        const variables = {
            correspondenceID: faker.database.mongodbObjectId()
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should delete a correspondence as admin`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId();
        
        const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, "deleteCorrespondence");
        deleteCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER }));

        const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `

        const variables = {
            correspondenceID
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
                .post('/graphql')
                .send({ query, variables })
                .set('Accept', 'application/json')
                .set('Cookie', [`jwt=${jwtToken}`]);
    
        expect(body.data.deleteCorrespondence.correspondenceID).toEqual(correspondenceID);
    });

    it(`should delete a correspondence as admin`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId();
        
        const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, "deleteCorrespondence");
        deleteCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType: CorrespondenceType.LETTER }));

        const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `

        const variables = {
            correspondenceID
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
                .post('/graphql')
                .send({ query, variables })
                .set('Accept', 'application/json')
                .set('Cookie', [`jwt=${jwtToken}`]);
    
        expect(body.data.deleteCorrespondence.correspondenceID).toEqual(correspondenceID);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId();
        
        const deleteCorrespondenceSpy = jest.spyOn(crudCorrespondence, "deleteCorrespondence");
        deleteCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.MUTATION_FAILED));

        const query = `
            mutation DeleteCorrespondence($correspondenceID: ID!) {
                deleteCorrespondence(correspondenceID: $correspondenceID) {
                    correspondenceID
                }
            }
        `

        const variables = {
            correspondenceID
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
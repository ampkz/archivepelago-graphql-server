import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as crudCorrespondence from '../../../../../src/db/archive/crud-correspondence';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';

dotenv.config();

describe(`Correspondence Query Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should return a created correspondence`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId();

        const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, "getCorrespondence");
        getCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, toID: faker.database.mongodbObjectId(), fromID: faker.database.mongodbObjectId(), correspondenceDate: faker.date.anytime().toDateString(), correspondenceType: CorrespondenceType.LETTER }));
        
        const query = `
            query {
                correspondence(correspondenceID: "${ correspondenceID }") {
                    correspondenceID
                }
            }
        `
        const { body } = await request(app)
            .post('/graphql')
            .send({ query })
            .set('Accept', 'application/json');

        expect(body.data.correspondence.correspondenceID).toEqual(correspondenceID);
    });

    it(`should throw and error if there was an issue getting a correspondence`, async () => {
        const correspondenceID: string = faker.database.mongodbObjectId();

        const getCorrespondenceSpy = jest.spyOn(crudCorrespondence, "getCorrespondence");
        getCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.SERVER_ERROR));
        
        const query = `
            query {
                correspondence(correspondenceID: "${ correspondenceID }") {
                    correspondenceID
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
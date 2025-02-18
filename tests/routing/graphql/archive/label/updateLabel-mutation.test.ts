import request from 'supertest';
import startServer from '../../../../../src/server/server';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudLabel from '../../../../../src/db/archive/crud-label';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import { Auth } from '../../../../../src/auth/authorization';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Label, LabelType } from '../../../../../src/archive/label';

dotenv.config();

describe(`updateLabel Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw unauthorized error if trying to update label without authorized user`, async () => {
        const query = `
            mutation UpdateLabel($input: UpdateLabelInput!) {
                updateLabel(input: $input) {
                    name
                    type
                }
            }
        `

        const variables = {
            input: {
                name: faker.word.adjective(),
                updatedName: faker.word.adjective(),
                updatedType: LabelType.NATIONALITY
            }
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should update a label as an admin`, async () => {
        const name: string = faker.word.adjective(),
            updatedName: string = faker.word.adjective();
        
        const updateLabelSpy = jest.spyOn(crudLabel, "updateLabel");
        updateLabelSpy.mockResolvedValue(new Label({name: updatedName, type:LabelType.NATIONALITY}));

        const query = `
            mutation UpdateLabel($input: UpdateLabelInput!) {
                updateLabel(input: $input) {
                    name
                    type
                }
            }
        `

        const variables = {
            input: {
                name,
                updatedName,
                updatedType: LabelType.NATIONALITY
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.updateLabel.name).toEqual(updatedName);
        expect(body.data.updateLabel.type).toEqual(LabelType.NATIONALITY);
    });

    it(`should update a label as a contributor`, async () => {
        const name: string = faker.word.adjective(),
            updatedName: string = faker.word.adjective();
        
        const updateLabelSpy = jest.spyOn(crudLabel, "updateLabel");
        updateLabelSpy.mockResolvedValue(new Label({name: updatedName, type:LabelType.PROFESSION}));

        const query = `
            mutation UpdateLabel($input: UpdateLabelInput!) {
                updateLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name,
                updatedName
            }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.updateLabel.name).toEqual(updatedName);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const name: string = faker.word.adjective(),
            updatedName: string = faker.word.adjective();
        
        const updateLabelSpy = jest.spyOn(crudLabel, "updateLabel");
        updateLabelSpy.mockRejectedValue(new InternalError(''));

        const query = `
            mutation UpdateLabel($input: UpdateLabelInput!) {
                updateLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name,
                updatedName
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
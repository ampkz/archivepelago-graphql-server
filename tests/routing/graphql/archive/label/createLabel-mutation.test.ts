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

describe(`createLabel Mutation Tests`, () => {
    let app: any;

    beforeAll(async() => {
        app = await startServer();
    })

    it(`should throw unauthorized error if trying to create label without authorized user`, async () => {
        const query = `
            mutation CreateLabel($input: CreateILabelnput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name: faker.word.adjective(),
                type: LabelType.PROFESSION
            }
        }

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json');

        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
    });

    it(`should create a label as an admin`, async () => {
        const name: string = faker.word.adjective();
        
        const createLabelSpy = jest.spyOn(crudLabel, "createLabel");
        createLabelSpy.mockResolvedValue(new Label({name, type: LabelType.PROFESSION}));

        const query = `
            mutation CreateLabel($input: CreateILabelnput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name,
                type: LabelType.PROFESSION
            }
        }
        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.createLabel.name).toEqual(name);
    });

    it(`should create a label as a contributor`, async () => {
        const name: string = faker.word.adjective();
        
        const createLabelSpy = jest.spyOn(crudLabel, "createLabel");
        createLabelSpy.mockResolvedValue(new Label({name, type: LabelType.PROFESSION}));

        const query = `
            mutation CreateLabel($input: CreateILabelnput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name,
                type: LabelType.PROFESSION
            }
        }
        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

        const { body } = await request(app)
            .post('/graphql')
            .send({ query, variables })
            .set('Accept', 'application/json')
            .set('Cookie', [`jwt=${jwtToken}`]);

        expect(body.data.createLabel.name).toEqual(name);
    });

    it(`should throw an error if there was an issue with the server`, async () => {
        const name: string = faker.word.adjective();
        
        const createLabelSpy = jest.spyOn(crudLabel, "createLabel");
        createLabelSpy.mockRejectedValue(new InternalError(''));

        const query = `
            mutation CreateLabel($input: CreateILabelnput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `

        const variables = {
            input: {
                name,
                type: LabelType.PROFESSION
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
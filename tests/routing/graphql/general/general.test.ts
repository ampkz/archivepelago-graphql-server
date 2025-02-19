import request from 'supertest';
import startServer from '../../../../src/server/server';
import dotenv from 'dotenv';

dotenv.config();

describe(`General Graphql Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it(`should throw an error with a malformed query`, async () => {
		const query = `
          mutation CreateUser($input: CreateUserInput!){
            createUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;

		const variables = {
			input: {},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toBeDefined();
	});
});

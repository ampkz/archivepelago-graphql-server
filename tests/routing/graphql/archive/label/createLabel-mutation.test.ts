import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudLabel from '../../../../../src/db/archive/crud-label';
import * as sessions from '../../../../../src/auth/session';
// import { signToken } from '../../../../../src/_helpers/auth-helpers';
import { Auth, AuthorizedUser } from '../../../../../src/auth/authorization';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Label, LabelType } from '../../../../../src/archive/label';

describe(`createLabel Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw unauthorized error if trying to create label without authorized user`, async () => {
		const query = `
            mutation CreateLabel($input: CreateLabelInput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `;

		const variables = {
			input: {
				name: `${(global as any).UniqueAdjIterator.next().value}`,
				type: LabelType.PROFESSION,
			},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should create a label as an admin`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const createLabelSpy = jest.spyOn(crudLabel, 'createLabel');
		createLabelSpy.mockResolvedValue(new Label({ name, type: LabelType.PROFESSION }));

		const query = `
            mutation CreateLabel($input: CreateLabelInput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `;

		const variables = {
			input: {
				name,
				type: LabelType.PROFESSION,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createLabel.name).toEqual(name);
	});

	it(`should create a label as a contributor`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const createLabelSpy = jest.spyOn(crudLabel, 'createLabel');
		createLabelSpy.mockResolvedValue(new Label({ name, type: LabelType.PROFESSION }));

		const query = `
            mutation CreateLabel($input: CreateLabelInput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `;

		const variables = {
			input: {
				name,
				type: LabelType.PROFESSION,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createLabel.name).toEqual(name);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const createLabelSpy = jest.spyOn(crudLabel, 'createLabel');
		createLabelSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation CreateLabel($input: CreateLabelInput!) {
                createLabel(input: $input) {
                    name
                }
            }
        `;

		const variables = {
			input: {
				name,
				type: LabelType.PROFESSION,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		// const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

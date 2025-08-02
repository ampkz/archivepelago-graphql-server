import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import * as crudCorrespondence from '../../../../../src/db/archive/crud-correspondence';
import sessions from '@ampkz/auth-neo4j/dist/validate-session-token';
import { generateSessionToken } from '@ampkz/auth-neo4j/dist/sessions/session';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import { Correspondence, CorrespondenceType } from '../../../../../src/archive/correspondence';
import { Auth } from '@ampkz/auth-neo4j/dist/auth/auth';
import { User } from '@ampkz/auth-neo4j/dist/users/user';

describe(`createCorrespondence Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw an unauthorized error without authorization`, async () => {
		const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			input: {
				correspondenceType: CorrespondenceType.LETTER,
			},
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should create a correspondence as admin`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType = CorrespondenceType.LETTER;

		const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'createCorrespondence');
		createCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType }));

		const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                    correspondenceDate {
                        year
                    }
                }
            }
        `;

		const variables = {
			input: {
				correspondenceType,
				correspondenceDate: {
					year: faker.date.anytime().getFullYear().toString(),
				},
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.ADMIN }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createCorrespondence.correspondenceID).toEqual(correspondenceID);
	});

	it(`should create a correspondence as contributor`, async () => {
		const correspondenceID: string = faker.database.mongodbObjectId(),
			correspondenceType: CorrespondenceType = CorrespondenceType.LETTER;

		const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'createCorrespondence');
		createCorrespondenceSpy.mockResolvedValue(new Correspondence({ correspondenceID, correspondenceType }));

		const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			input: {
				correspondenceType,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.data.createCorrespondence.correspondenceID).toEqual(correspondenceID);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'createCorrespondence');
		createCorrespondenceSpy.mockRejectedValue(new InternalError(GraphQLErrors.MUTATION_FAILED));

		const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			input: {
				correspondenceType: CorrespondenceType.LETTER,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});

	it(`should return undefined if no correspondence was created`, async () => {
		const createCorrespondenceSpy = jest.spyOn(crudCorrespondence, 'createCorrespondence');
		createCorrespondenceSpy.mockResolvedValue(undefined);

		const query = `
            mutation CreateCorrespondence($input: CreateCorrespondenceInput!) {
                createCorrespondence(input: $input) {
                    correspondenceID
                }
            }
        `;

		const variables = {
			input: {
				correspondenceType: CorrespondenceType.LETTER,
			},
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new User({ email: faker.internet.email(), auth: Auth.CONTRIBUTOR }),
		});

		const token = generateSessionToken();

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`token=${token}`]);

		expect(body.createCorrespondence).toBeUndefined();
	});
});

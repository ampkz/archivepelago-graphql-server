import request from 'supertest';
import startServer from '../../../../../src/server/server';
import { faker } from '@faker-js/faker';
import { Errors as GraphQLErrors } from '../../../../../src/graphql/errors/errors';
import * as crudLabel from '../../../../../src/db/archive/crud-label';
import * as sessions from '../../../../../src/auth/session';
import { signToken } from '../../../../../src/_helpers/auth-helpers';
import { Auth, AuthorizedUser } from '../../../../../src/auth/authorization';
import { InternalError } from '../../../../../src/_helpers/errors-helper';
import { Label, LabelType } from '../../../../../src/archive/label';

describe(`deleteLabel Mutation Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it(`should throw unauthorized error if trying to delete label without authorized user`, async () => {
		const query = `
            mutation DeleteLabel($name: ID!) {
                deleteLabel(name: $name) {
                    name
                }
            }
        `;

		const variables = {
			name: `${(global as any).UniqueAdjIterator.next().value}`,
		};

		const { body } = await request(app).post('/graphql').send({ query, variables }).set('Accept', 'application/json');

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
	});

	it(`should delete a label as an admin`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const deleteLabelSpy = jest.spyOn(crudLabel, 'deleteLabel');
		deleteLabelSpy.mockResolvedValue(new Label({ name, type: LabelType.PROFESSION }));

		const query = `
            mutation DeleteLabel($name: ID!) {
                deleteLabel(name: $name) {
                    name
                }
            }
        `;

		const variables = {
			name,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.deleteLabel.name).toEqual(name);
	});

	it(`should delete a label as a contributor`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const deleteLabelSpy = jest.spyOn(crudLabel, 'deleteLabel');
		deleteLabelSpy.mockResolvedValue(new Label({ name, type: LabelType.PROFESSION }));

		const query = `
            mutation DeleteLabel($name: ID!) {
                deleteLabel(name: $name) {
                    name
                }
            }
        `;

		const variables = {
			name,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.CONTRIBUTOR, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.data.deleteLabel.name).toEqual(name);
	});

	it(`should throw an error if there was an issue with the server`, async () => {
		const name: string = `${(global as any).UniqueAdjIterator.next().value}`;

		const deleteLabelSpy = jest.spyOn(crudLabel, 'deleteLabel');
		deleteLabelSpy.mockRejectedValue(new InternalError(''));

		const query = `
            mutation DeleteLabel($name: ID!) {
                deleteLabel(name: $name) {
                    name
                }
            }
        `;

		const variables = {
			name,
		};

		const validateSessionTokenSpy = jest.spyOn(sessions, 'validateSessionToken');
		validateSessionTokenSpy.mockResolvedValueOnce({
			session: { id: '', expiresAt: new Date(), userID: '' },
			user: new AuthorizedUser(faker.internet.email(), Auth.ADMIN, ''),
		});

		const token = sessions.generateSessionToken();

		const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, token, '1d');

		const { body } = await request(app)
			.post('/graphql')
			.send({ query, variables })
			.set('Accept', 'application/json')
			.set('Cookie', [`jwt=${jwtToken}`]);

		expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
	});
});

import { faker } from '@faker-js/faker';
import { signToken, verifyToken } from '../../src/_helpers/auth-helpers';
import { Auth } from '../../src/auth/authorization';
import { generateSessionToken } from '../../src/auth/session';

describe(`Auth Helpers Tests`, () => {
	it('should sign and verify a jwt token', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN,
			token = generateSessionToken();

		const jwtToken = signToken(email, auth, token, '1d');
		const { user, authToken } = verifyToken(jwtToken);

		expect(user).toBeDefined();
		expect(user?.auth).toEqual(auth);
		expect(user?.email).toEqual(email);
		expect(authToken).toEqual(token);
	});

	it('should return an undefined authorizedUser with invalid token', () => {
		const { user, authToken } = verifyToken('invalid token');

		expect(user).toBeUndefined();
		expect(authToken).toBeUndefined();
	});
});

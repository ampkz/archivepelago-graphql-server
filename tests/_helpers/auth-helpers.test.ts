import { faker } from '@faker-js/faker';
import { signToken, verifyToken } from '../../src/_helpers/auth-helpers';
import { Auth, AuthorizedUser } from '../../src/auth/authorization';

describe(`Auth Helpers Tests`, () => {
	it('should sign and verify a jwt token', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN;

		const jwtToken = signToken(email, auth, '1d');
		const authorizedUser = verifyToken(jwtToken);

		expect(authorizedUser).toBeDefined();
		expect(authorizedUser?.auth).toEqual(auth);
		expect(authorizedUser?.email).toEqual(email);
	});

	it('should return an undefined authorizedUser with invalid token', () => {
		const authorizedUser: AuthorizedUser | undefined = verifyToken('invalid token');

		expect(authorizedUser).toBeUndefined();
	});
});

import { faker } from '@faker-js/faker';
import { Auth, AuthorizedUser, isPermitted, permitSelf } from '../../src/auth/authorization';

describe(`Authorization Tests`, () => {
	it('should create and Authorized User', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN;

		const authUser: AuthorizedUser = new AuthorizedUser(email, auth);

		expect(authUser.auth).toEqual(auth);
		expect(authUser.email).toEqual(email);
	});
});

describe(`Authentication Tests`, () => {
	test('isPermitted should not permit an undefined authorizedUser', () => {
		expect(isPermitted(undefined, Auth.ADMIN)).toBeFalsy();
	});

	test('isPermitted should permit an admin', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN;

		const authUser: AuthorizedUser = new AuthorizedUser(email, auth);
		expect(isPermitted(authUser, Auth.ADMIN)).toBeTruthy();
	});

	test('isPermitted should permit a contributor', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.CONTRIBUTOR;

		const authUser: AuthorizedUser = new AuthorizedUser(email, auth);
		expect(isPermitted(authUser, Auth.ADMIN, Auth.CONTRIBUTOR)).toBeTruthy();
	});

	test('isPermitted should permit an admin', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN;

		const authUser: AuthorizedUser = new AuthorizedUser(email, auth);
		expect(isPermitted(authUser, Auth.ADMIN, Auth.CONTRIBUTOR)).toBeTruthy();
	});

	test('permitSelf should not permit an undefined authorizedUser', () => {
		expect(permitSelf(undefined, faker.internet.email())).toBeFalsy();
	});

	test('permitSelf should not permit self', () => {
		const email: string = faker.internet.email(),
			auth: Auth = Auth.ADMIN;

		const authUser: AuthorizedUser = new AuthorizedUser(email, auth);
		expect(permitSelf(authUser, email)).toBeTruthy();
	});
});

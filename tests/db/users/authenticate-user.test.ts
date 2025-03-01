import { checkPassword } from '../../../src/db/users/authenticate-user';
import { faker } from '@faker-js/faker';
import { User } from '../../../src/users/users';
import { Auth } from '../../../src/auth/authorization';
import { createUser } from '../../../src/db/users/crud-user';

describe(`Authenticate User Tests`, () => {
	it(`should return an undefined user if no user exists`, async () => {
		const user = await checkPassword(faker.internet.email(), faker.internet.password());

		expect(user).toBeUndefined();
	});

	it(`should return an undefined user if passwords do not match`, async () => {
		const newUser: User = new User(faker.internet.email(), Auth.ADMIN, faker.person.firstName(), faker.person.lastName());
		const password: string = faker.internet.password();
		await createUser(newUser, password);

		const user = await checkPassword(newUser.email, faker.internet.password());

		expect(user).toBeUndefined();
	});

	it(`should return a user with the same properties with a correct password`, async () => {
		const newUser: User = new User(faker.internet.email(), Auth.ADMIN, faker.person.firstName(), faker.person.lastName());
		const password: string = faker.internet.password();
		await createUser(newUser, password);

		const user = await checkPassword(newUser.email, password);

		expect(user).toBeDefined();
		expect(user).toEqual(newUser);
	});
});

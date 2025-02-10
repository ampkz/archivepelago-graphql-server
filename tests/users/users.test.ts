import { Auth } from "../../src/auth/authorization";
import { User } from "../../src/users/users";
import { faker } from '@faker-js/faker';

describe(`Users Tests`, () => {
    it(`should initialize a User's email, auth, firstName, lastName, and secondName`, () => {
        const email = faker.internet.email(),
            auth = Auth.CONTRIBUTOR,
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, auth, firstName, lastName, secondName);
        expect(user.email).toEqual(email);
        expect(user.firstName).toEqual(firstName);
        expect(user.lastName).toEqual(lastName);
        expect(user.secondName).toEqual(secondName);
        expect(user.auth).toEqual(auth);
    });

    it(`should initialize an empty string if no secondName is given`, () => {
        const email = faker.internet.email(),
            auth = Auth.ADMIN,
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName();
        
        const user:User = new User(email, auth, firstName, lastName);
        expect(user.email).toEqual(email);
        expect(user.firstName).toEqual(firstName);
        expect(user.lastName).toEqual(lastName);
        expect(user.secondName).toEqual('');
        expect(user.auth).toEqual(auth);
    });
})
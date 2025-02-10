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
        expect(user.getEmail()).toEqual(email);
        expect(user.getFirstName()).toEqual(firstName);
        expect(user.getLastName()).toEqual(lastName);
        expect(user.getSecondName()).toEqual(secondName);
        expect(user.getAuth()).toEqual(auth);
    });

    it(`should initialize an empty string if no secondName is given`, () => {
        const email = faker.internet.email(),
            auth = Auth.ADMIN,
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName();
        
        const user:User = new User(email, auth, firstName, lastName);
        expect(user.getEmail()).toEqual(email);
        expect(user.getFirstName()).toEqual(firstName);
        expect(user.getLastName()).toEqual(lastName);
        expect(user.getSecondName()).toEqual('');
        expect(user.getAuth()).toEqual(auth);
    });
})
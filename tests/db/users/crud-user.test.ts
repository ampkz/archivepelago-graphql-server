import dotenv from 'dotenv';
import { destroyTestingDBs, initializeDBs } from '../../../src/db/utils/init-dbs';
import { faker } from '@faker-js/faker';
import { User } from '../../../src/users/users';
import { Auth } from '../../../src/auth/authorization';
import { createUser, deleteUser, getUserByEmail, updateUser } from '../../../src/db/users/crud-user';
import { Errors as CRUDErrors } from '../../../src/db/utils/crud';

dotenv.config();

describe(`User DB Tests`, ()=> {

    beforeAll(async () => {
        await initializeDBs();
    });

    afterAll(async () => {
        await destroyTestingDBs();
    });

    it(`should create a new user`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        const createdUser: User = await createUser(user, faker.internet.password());
        expect(user).toEqual(createdUser);
    });

    it(`should throw an error if trying to add user whose email already exists in the DB`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();
        
        const user:User = new User(email, Auth.CONTRIBUTOR, firstName, lastName, secondName);
        await createUser(user, faker.internet.password());
        
        await expect(createUser(user, faker.internet.password())).rejects.toThrow(CRUDErrors.CANNOT_CREATE_NODE);
    });

    it(`should get a created user by email`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();
        
        const user:User = new User(email, Auth.CONTRIBUTOR, firstName, lastName, secondName);
        const createdUser: User | undefined = await createUser(user, faker.internet.password());

        const matchedUser: User | undefined = await getUserByEmail(email);

        expect(matchedUser).toEqual(createdUser);
    });

    it(`should return undefined if no user was found`, async () => {
        const matchedUser: User | undefined = await getUserByEmail(faker.internet.email());

        expect(matchedUser).toBeUndefined();
    });

    it(`should delete a created user`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();
        
        const user:User = new User(email, Auth.CONTRIBUTOR, firstName, lastName, secondName);
        const createdUser: User | undefined = await createUser(user, faker.internet.password());

        const deletedUser: User | undefined = await deleteUser(email);

        expect(deletedUser).toEqual(createdUser);
    });

    it(`should return undefined if no user was found to delete`, async () => {
        const deletedUser: User | undefined = await deleteUser(faker.internet.email());

        expect(deletedUser).toBeUndefined();
    });

    it(`should update a created user`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();
        
        const updatedFirstName = faker.person.firstName(),
            updatedLastName = faker.person.lastName(),
            updatedSecondName = faker.person.middleName(),
            updatedEmail = faker.internet.password();
        
        const user:User = new User(email, Auth.CONTRIBUTOR, firstName, lastName, secondName);
        await createUser(user, faker.internet.password());

        const updatedUser: User | undefined = await updateUser(email, { updatedAuth: Auth.ADMIN, updatedFirstName, updatedLastName, updatedSecondName, updatedPassword: faker.internet.password(), updatedEmail });

        expect(updatedUser).toEqual(new User(updatedEmail, Auth.ADMIN, updatedFirstName, updatedLastName, updatedSecondName));
    });

    it(`should return undefined if no user is updated`, async () => {
        const email = faker.internet.email();
        
        const updatedFirstName = faker.person.firstName(),
            updatedLastName = faker.person.lastName(),
            updatedSecondName = faker.person.middleName(),
            updatedEmail = faker.internet.password();
        
        const updatedUser: User | undefined = await updateUser(email, { updatedAuth: Auth.ADMIN, updatedFirstName, updatedLastName, updatedSecondName, updatedPassword: faker.internet.password(), updatedEmail });

        expect(updatedUser).toBeUndefined();
    });

    it(`should throw an error when trying to update to an existing email`, async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();
        
        const updatedFirstName = faker.person.firstName(),
            updatedLastName = faker.person.lastName(),
            updatedSecondName = faker.person.middleName();
        
        const secondEmail = faker.internet.email();

        const user:User = new User(email, Auth.CONTRIBUTOR, firstName, lastName, secondName);
        
        await createUser(user, faker.internet.password());
        
        user.email = secondEmail;

        await createUser(user, faker.internet.password());

        await expect(updateUser(email, { updatedAuth: Auth.ADMIN, updatedFirstName, updatedLastName, updatedSecondName, updatedPassword: faker.internet.password(), updatedEmail: secondEmail })).rejects.toThrow(CRUDErrors.CANNOT_UPDATE_NODE);
    });
    
});
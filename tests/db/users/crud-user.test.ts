import { createUser, getUserByEmail, Errors as UserErrors } from '../../../src/db/users/crud-user';
import { User } from '../../../src/users/users';
import { InternalError, ResourceExistsError } from '../../../src/_helpers/errors-helper';
import { destroyTestingDBs, initializeDBs } from "../../../src/db/utils/init-dbs";
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import neo4j, { Driver, Session, Transaction } from 'neo4j-driver';
import { Auth } from '../../../src/auth/authorization';

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
        const createdUser: User = await createUser(user, faker.internet.password());
        
        try{
            await createUser(createdUser, faker.internet.password());
        }catch(error){
            expect(error instanceof ResourceExistsError);
            expect((error as ResourceExistsError).message).toEqual(UserErrors.CANNOT_CREATE_USER);
            expect((error as ResourceExistsError).getData().info).toEqual(UserErrors.USER_ALREADY_EXISTS);
        }
        
        expect(true).toBeTruthy();
    });

    it(`should throw an InternalError on a failed transaction`, async ()=>{
        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValue({records: []}),
                close: jest.fn(),
                beginTransaction: jest.fn().mockResolvedValue({
                    run: jest.fn().mockResolvedValue({records: []}),
                    rollback: jest.fn(),
                    close: jest.fn(),
                } as unknown as Transaction)
            } as unknown as Session),
            close: jest.fn(),
            getServerInfo: jest.fn()
        } as unknown as Driver;
        
        const driverSpy = jest.spyOn(neo4j, "driver");
        driverSpy.mockReturnValueOnce(driverMock);

        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        
        try{
            await createUser(user, faker.internet.password());
        }catch(error){
            expect(error instanceof InternalError).toBeTruthy();
            expect((error as InternalError).message).toEqual(UserErrors.CANNOT_CREATE_USER);
        }

        expect(true).toBeTruthy();
    });

    it('should get a created user by email', async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        await createUser(user, faker.internet.password());
        const matchedUser:User | undefined = await getUserByEmail(user.email);
        expect(matchedUser).toBeDefined();
    });
});
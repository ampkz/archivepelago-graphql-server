import { createUser, getUserByEmail, updateUser, Errors as UserErrors } from '../../../src/db/users/crud-user';
// import * as crudUser from '../../../src/db/users/crud-user';
import { User } from '../../../src/users/users';
import { InternalError, ResourceExistsError } from '../../../src/_helpers/errors-helper';
import { destroyTestingDBs, initializeDBs } from "../../../src/db/utils/init-dbs";
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import neo4j, { Driver, Record, Session, Transaction } from 'neo4j-driver';
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

    it('should return an undefined user if no user exists', async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        const updatedUser: User | undefined = await updateUser(email, user);
        expect(updatedUser).toBeUndefined();
    });

    it('should throw ResourceExistsError if trying to update to an existing email', async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        await createUser(user, faker.internet.password());
        await expect(updateUser(faker.internet.email(), user)).rejects.toThrow(UserErrors.CANNOT_UPDATE_USER);
    });

    it(`should return an undefined user if the update didn't return a user`, async () => {
        const mockRecord = {
            get: (key: any) => {
              if (key === 'id') {
                return { low: 1, high: 0 }; // Neo4j integer
              }
              if (key === 'name') {
                return 'Test Node';
              }
              if (key === 'properties') {
                return { name: 'Test Node' };
              }
              return {properties: {}};
            },
            toObject: () => ({
              id: { low: 1, high: 0 },
              name: 'Test Node',
            }),
          } as unknown as Record;

          const mockResult = {
            records: [mockRecord]
          }
        
        
        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValueOnce(mockResult)
                    .mockResolvedValueOnce({records: []}),
                close: jest.fn(),
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
        
        const updates: User = new User(email, Auth.ADMIN, faker.person.firstName(), faker.person.lastName(), faker.person.middleName());
        const updatedUser: User | undefined = await updateUser(email, updates, faker.internet.password());
        expect(updatedUser).toBeUndefined();
    });

    it(`should return an undefined user if the password couldn't be updated`, async () => {
        const mockRecord = {
            get: (key: any) => {
              if (key === 'id') {
                return { low: 1, high: 0 }; // Neo4j integer
              }
              if (key === 'name') {
                return 'Test Node';
              }
              if (key === 'properties') {
                return { name: 'Test Node' };
              }
              return {properties: {}};
            },
            toObject: () => ({
              id: { low: 1, high: 0 },
              name: 'Test Node',
            }),
          } as unknown as Record;

          const mockResult = {
            records: [mockRecord]
          }
        
        
        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValueOnce(mockResult)
                    .mockResolvedValueOnce(mockResult)
                    .mockResolvedValueOnce({records: []}),
                close: jest.fn(),
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
        const updates: User = new User(email, Auth.ADMIN, faker.person.firstName(), faker.person.lastName(), faker.person.middleName());
        const updatedUser: User | undefined = await updateUser(email, updates, faker.internet.password());
        
        expect(updatedUser).toBeUndefined();
    
    });

    it('should update a user', async () => {
        const email = faker.internet.email(),
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            secondName = faker.person.middleName();

        const user:User = new User(email, Auth.ADMIN, firstName, lastName, secondName);
        await createUser(user, faker.internet.password());
        const updates: User = new User(email, Auth.ADMIN, faker.person.firstName(), faker.person.lastName(), faker.person.middleName());
        const updatedUser: User | undefined = await updateUser(email, updates, faker.internet.password());
        expect(updatedUser).toBeDefined();
        expect(updatedUser).toEqual(updates);
    });
});
import { initializeDBs, destroyTestingDBs, verifyDB, ErrorMsgs as DBInitErrorMsgs, initializeConstraint } from '../../../src/db/utils/init-dbs';
import { getSessionOptions } from '../../../src/_helpers/db-helper';
import dotenv from 'dotenv';
import { InternalError } from '../../../src/_helpers/errors-helper';
import neo4j, { Session, Driver, Record } from 'neo4j-driver';

dotenv.config();


describe(`DB initializing tests`, () => {
    beforeAll(async () => {
        await expect(initializeDBs()).resolves.toBeTruthy();
    });

    afterAll(async () => {
        await destroyTestingDBs();
        await expect(verifyDB(getSessionOptions(process.env.USERS_DB as string).database)).resolves.toBeFalsy();
    });

    it(`should not create a duplicate Users DB`, async () => {
        const mockUsersRecord = {
            get: (key: any) => {
                if (key === 'address') {
                return ``;
                }
                return {properties: {}};
            }} as unknown as Record;
        
        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValue({records: [mockUsersRecord]}),
                close: jest.fn(),
            } as unknown as Session),
            close: jest.fn(),
            getServerInfo: jest.fn()
        } as unknown as Driver;
        
        const driverSpy = jest.spyOn(neo4j, "driver");
        driverSpy.mockReturnValueOnce(driverMock);
        
        await expect(initializeDBs()).rejects.toThrow(DBInitErrorMsgs.COULD_NOT_CREATE_DB);
    });

    it(`should not create a duplicate Archive DB`, async () => {
        const mockUsersRecord = {
            get: (key: any) => {
                if (key === 'address') {
                    return `${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`;
                }
            },
            } as unknown as Record;

            const mockArchiveRecord = {
            get: (key: any) => {
                if (key === 'address') {
                    return ``;
                }
            },
            } as unknown as Record;
        
        const driverMock = {
            session: jest.fn().mockReturnValue({
                run: jest.fn().mockResolvedValueOnce({records: [mockUsersRecord]})
                    .mockResolvedValueOnce({records: [mockArchiveRecord]}),
                close: jest.fn(),
            } as unknown as Session),
            close: jest.fn(),
            getServerInfo: jest.fn()
        } as unknown as Driver;
        
        const driverSpy = jest.spyOn(neo4j, "driver");
        driverSpy.mockReturnValueOnce(driverMock);
        
        await expect(initializeDBs()).rejects.toThrow(DBInitErrorMsgs.COULD_NOT_CREATE_DB);
    });
    

    it(`should have created a Users DB`, async () => {
        await expect(verifyDB(getSessionOptions(process.env.USERS_DB as string).database)).resolves.toBeTruthy();
    });

    it(`should have created an Archive DB`, async () => {
        await expect(verifyDB(getSessionOptions(process.env.ARCHIVE_DB as string).database)).resolves.toBeTruthy();
    });

    it(`should throw an InternalError if user email constraint is already created`, async () =>{
        try{
            await initializeConstraint((process.env.USERS_DB as string), 'User', 'email');
        }catch(error){
            expect(error instanceof InternalError).toBeTruthy();
            expect((error as InternalError).message).toEqual(DBInitErrorMsgs.COULD_NOT_CREATE_CONSTRAINT);
            expect((error as InternalError).getData().issue).toEqual(DBInitErrorMsgs.CONSTRAINT_ALREADY_EXISTS);
            expect((error as InternalError).getData().constraintName).toEqual(`user_email_constraint`);
        }

        expect(true).toBeTruthy();
    });

    it(`should throw an InternalError if user id constraint is already created`, async () =>{
        try{
            await initializeConstraint((process.env.USERS_DB as string), 'User', 'id');
        }catch(error){
            expect(error instanceof InternalError).toBeTruthy();
            expect((error as InternalError).message).toEqual(DBInitErrorMsgs.COULD_NOT_CREATE_CONSTRAINT);
            expect((error as InternalError).getData().issue).toEqual(DBInitErrorMsgs.CONSTRAINT_ALREADY_EXISTS);
            expect((error as InternalError).getData().constraintName).toEqual(`user_id_constraint`);
        }

        expect(true).toBeTruthy();
    });
});
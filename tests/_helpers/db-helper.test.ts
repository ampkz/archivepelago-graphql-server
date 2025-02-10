import { getSessionOptions } from '../../src/_helpers/db-helper';
import dotenv from 'dotenv';

dotenv.config();

describe('Session DB Tests', () => {
    const originalEnv: NodeJS.ProcessEnv = process.env;
    const dbName: string = 'TestDB';

    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        process.env = originalEnv;
    });
    
    it(`should append 'test' to the DB name in a testing environment`, () => {
        expect(getSessionOptions(dbName).database).toEqual(`${dbName}test`);
    });

    it(`should append 'production' to the DB name with process.env.NODE_ENV set to production`, () => {
        process.env = {
            ...originalEnv,
            NODE_ENV: `production`
        }
        expect(getSessionOptions(dbName).database).toEqual(`${dbName}production`);
    });

    it(`shouldn't append anything to the DB name with an undefined process.env.NODE_ENV`, () => {
        delete process.env.NODE_ENV;
        expect(getSessionOptions(dbName).database).toEqual(dbName);
    });
});
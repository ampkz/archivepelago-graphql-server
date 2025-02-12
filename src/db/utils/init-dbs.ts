import { connect } from "./connection";
import { Driver, Session, RecordShape, Record } from 'neo4j-driver';
import { getSessionOptions } from "../../_helpers/db-helper";
import { InternalError } from "../../_helpers/errors-helper";

export enum ErrorMsgs {
    COULD_NOT_CREATE_DB = 'Could Not Create Database',
    COULD_NOT_CREATE_CONSTRAINT = 'Could Not Create Constraint',
    CONSTRAINT_ALREADY_EXISTS = 'Constrain Already Exists',
};

export async function initializeDBs() : Promise<boolean> {
    const driver: Driver = await connect();
    let session: Session,
        match: RecordShape;

    session = driver.session();
    
    match = await session.run(`CREATE DATABASE ${getSessionOptions(process.env.USERS_DB as string).database} IF NOT EXISTS WAIT`);

    if((match.records[0] as Record).get(`address`) != `${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`) {
        await session.close();
        await driver.close();
        throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_DB);
    };

    match = await session.run(`CREATE DATABASE ${getSessionOptions(process.env.ARCHIVE_DB as string).database} IF NOT EXISTS WAIT`);

    if((match.records[0] as Record).get(`address`) != `${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`) {
        await session.close();
        await driver.close();
        throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_DB);
    };

    await session.close();
    await driver.close();

    await initializeConstraint(process.env.USERS_DB as string, 'User', 'email');
    await initializeConstraint(process.env.USERS_DB as string, 'User', 'id');

    return true;
}

export async function initializeConstraint(dbName: string, node: string, property: string): Promise<boolean> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));

    const constraintName: string = `${node.toLowerCase()}_${property.toLowerCase()}_constraint`;

    const match: RecordShape = await session.run(`CREATE CONSTRAINT ${constraintName} IF NOT EXISTS FOR (n:${node}) REQUIRE n.${property} IS UNIQUE`);

    if(match.summary.counters._stats.constraintsAdded !== 1){
        session.close();
        driver.close();
        throw new InternalError(ErrorMsgs.COULD_NOT_CREATE_CONSTRAINT, { issue: ErrorMsgs.CONSTRAINT_ALREADY_EXISTS, constraintName });
    };

    await session.close();
    await driver.close();
    return true;
}

export async function verifyDB(dbName: string): Promise<boolean> {
    const driver: Driver = await connect();
    const session: Session = driver.session();
    const match: RecordShape = await session.run(`SHOW DATABASE ${dbName}`);
    await session.close();
    await driver.close();
    return match.records.length === 1;
}

export async function destroyTestingDBs(): Promise<void> {
    const driver: Driver = await connect();
    const session: Session = driver.session();
    await session.run(`DROP DATABASE ${getSessionOptions(process.env.USERS_DB as string).database} IF EXISTS DESTROY DATA WAIT`);
    await session.run(`DROP DATABASE ${getSessionOptions(process.env.ARCHIVE_DB as string).database} IF EXISTS DESTROY DATA WAIT`);
    await session.close();
    await driver.close();
}
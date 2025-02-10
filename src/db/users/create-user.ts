import { Driver, RecordShape, Session, Transaction } from "neo4j-driver";
import { connect } from "../utils/connection";
import { getSessionOptions } from "../../_helpers/db-helper";
import * as bcrypt from 'bcrypt';
import { InternalError, ResourceExistsError } from "../../_helpers/errors-helper";
import { User } from "../../users/users";

export enum Errors {
    CANNOT_CREATE_USER = 'Cannot Create User',
    USER_ALREADY_EXISTS = 'User Already Exists',
}

export async function createUser(user: User, pwd: string, saltRounds: number = 10): Promise<User> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(process.env.USERS_DB as string));
    let match: RecordShape;

    match = await session.run(`MATCH(u:User { email: $email }) RETURN u`, { email: user.getEmail() });

    if(match.records.length >= 1){
        await session.close();
        await driver.close();
        throw new ResourceExistsError(Errors.CANNOT_CREATE_USER, { info: Errors.USER_ALREADY_EXISTS })
    }

    const pwdHash: string = await bcrypt.hash(pwd, saltRounds);
    const txc: Transaction = await session.beginTransaction();
    match = await txc.run(`CREATE(u:User { id:apoc.create.uuid(), email: $email, firstName: $firstName, lastName: $lastName, secondName: $secondName, auth: $auth, pwd: $pwdHash }) RETURN u`, { email: user.getEmail(), firstName: user.getFirstName(), lastName: user.getLastName(), secondName: user.getSecondName(), auth: user.getAuth(), pwdHash });

    if(match.records.length !== 1){
        await txc.rollback();
        await txc.close();
        await session.close();
        await driver.close();
        throw new InternalError(Errors.CANNOT_CREATE_USER);
    }

    await txc.commit();
    await txc.close();
    await session.close();
    await driver.close();

    return user;
}
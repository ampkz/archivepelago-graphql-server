import { Driver, RecordShape, Session } from "neo4j-driver";
import { connect } from "../utils/connection";
import { getSessionOptions } from "../../_helpers/db-helper";
import * as bcrypt from 'bcrypt';
import { InternalError, ResourceExistsError } from "../../_helpers/errors-helper";
import { User, UpdatedUser } from "../../users/users";

export enum Errors {
    CANNOT_CREATE_USER = 'Cannot Create User',
    USER_ALREADY_EXISTS = 'User Already Exists',
    CANNOT_UPDATE_USER = 'Cannot Update User',
    CANNOT_DELETE_USER = 'Cannot Delete User',
}

export async function createUser(user: User, pwd: string): Promise<User> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(process.env.USERS_DB as string));
    let matchedUser: User | undefined = await getUserByEmail(user.email, session);

    if(matchedUser){
        await session.close();
        await driver.close();
        throw new ResourceExistsError(Errors.CANNOT_CREATE_USER, { info: Errors.USER_ALREADY_EXISTS })
    }

    const pwdHash: string = await bcrypt.hash(pwd, parseInt(process.env.SALT_ROUNDS as string));
    const match = await session.run(`CREATE(u:User { id:apoc.create.uuid(), email: $email, firstName: $firstName, lastName: $lastName, secondName: $secondName, auth: $auth, pwd: $pwdHash }) RETURN u`, { email: user.email, firstName: user.firstName, lastName: user.lastName, secondName: user.secondName, auth: user.auth, pwdHash });

    if(match.records.length !== 1){
        await session.close();
        await driver.close();
        throw new InternalError(Errors.CANNOT_CREATE_USER);
    }

    await session.close();
    await driver.close();

    return user;
}

export async function getUserByEmail(email: string, session?: Session): Promise<User | undefined> {
    let user: User | undefined = undefined;
    let driver: Driver | undefined = undefined,
        newSession: Session;

    if(!session){
        driver = await connect();
        newSession = driver.session(getSessionOptions(process.env.USERS_DB as string));
    }else{
        newSession = session;
    }

    let match: RecordShape;

    match = await newSession.run(`MATCH(u:User { email: $email }) RETURN u`, { email });

    if(match.records.length === 1){
        const matchedUser = match.records[0].get(0).properties;
        user = new User(matchedUser.email, matchedUser.auth, matchedUser.firstName, matchedUser.lastName, matchedUser.secondName);
    }

    if(driver){
        await driver.close();
        await newSession.close();
    }

    return user;
}

export async function updateUser(emailToUpdate: string, updatedUser: UpdatedUser, newPassword?: string | null ): Promise<User | undefined> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(process.env.USERS_DB as string));

    if(updatedUser.email && emailToUpdate !== updatedUser.email){
        const matchedUser: User | undefined = await getUserByEmail(updatedUser.email, session);
        if(matchedUser){
            await driver.close();
            await session.close();
            throw new ResourceExistsError(Errors.CANNOT_UPDATE_USER, { info: Errors.USER_ALREADY_EXISTS });
        }
    }

    const userToUpdate:User | undefined = await getUserByEmail(emailToUpdate, session);

    if(!userToUpdate){
        await session.close();
        await driver.close();

        return undefined;
    }

    /* istanbul ignore next */
    const firstNameToUpdate = updatedUser.firstName || userToUpdate.firstName,
        lastNameToUpdate = updatedUser.lastName || userToUpdate.lastName,
        authToUpdate = updatedUser.auth || userToUpdate.auth,
        updatedEmail = updatedUser.email || userToUpdate.email,
        secondNameToUpdate = updatedUser.secondName || userToUpdate.secondName;

    let match: RecordShape = await session.run(`MATCH (u:User { email: $email }) SET u.firstName = $firstName, u.lastName = $lastName, u.auth = $auth, u.email = $updatedEmail, u.secondName = $secondName RETURN u`, { email: emailToUpdate, firstName: firstNameToUpdate, lastName: lastNameToUpdate, auth: authToUpdate, updatedEmail , secondName: secondNameToUpdate });
    
    if(match.records.length === 0) {
        await session.close();
        await driver.close();

        return undefined;
    }

    if(newPassword){
        const pwdHash: string = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS as string));
        match = await session.run(`MATCH (u:User { email: $email }) SET u.password = $pwdHash RETURN u`, { email: updatedEmail, pwdHash  });
        
        if(match.records.length !== 1){
            await driver.close();
            await session.close();

            return undefined;
        }
    }

    await driver.close();
    await session.close();

    const { email, firstName, secondName, lastName, auth } = match.records[0].get(0).properties;

    return new User(email, auth, firstName, lastName, secondName);
}

export async function deleteUser(email: string): Promise<User | undefined> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(process.env.USERS_DB as string));

    const user: User | undefined = await getUserByEmail(email, session);

    if(user){
        const match: RecordShape = await session.run('MATCH (u:User {email: $email}) DELETE u', { email });
        
        if(match.summary.counters._stats.nodesDeleted !== 1){
            await session.close();
            await driver.close();
            throw new InternalError(Errors.CANNOT_DELETE_USER);
        }
    }

    await session.close();
    await driver.close();

    return user;
}
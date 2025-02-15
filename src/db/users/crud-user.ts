import * as bcrypt from 'bcrypt';
import { User, UpdatedUserI } from "../../users/users";
import { createNode, deleteNode, getNode, updateNode } from "../utils/crud";
import { NodeType } from '../../_helpers/nodes';

export enum Errors {
    CANNOT_CREATE_USER = 'Cannot Create User',
    USER_ALREADY_EXISTS = 'User Already Exists',
    CANNOT_UPDATE_USER = 'Cannot Update User',
    CANNOT_DELETE_USER = 'Cannot Delete User',
}

export async function createUser(user: User, pwd: string): Promise<User> {
    const pwdHash: string = await bcrypt.hash(pwd, parseInt(process.env.SALT_ROUNDS as string));

    await createNode(NodeType.USER, [`id:apoc.create.uuid(), email: $email, firstName: $firstName, lastName: $lastName, secondName: $secondName, auth: $auth, pwd: $pwdHash`], { email: user.email, firstName: user.firstName, lastName: user.lastName, secondName: user.secondName, auth: user.auth, pwdHash }, (process.env.USERS_DB as string));

    return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    let user: User | undefined = undefined;

    const matchedUser: any | undefined = await getNode(NodeType.USER, `email: $email`, { email }, (process.env.USERS_DB as string));

    if(matchedUser){
        user = new User(matchedUser.email, matchedUser.auth, matchedUser.firstName, matchedUser.lastName, matchedUser.secondName);
    }

    return user;
}

export async function deleteUser(email: string): Promise<User | undefined> {
    let user: User | undefined = undefined;

    const deletedUser: any | undefined = await deleteNode(NodeType.USER, `email: $email`, { email }, (process.env.USERS_DB as string));

    if(deletedUser){
        user = new User(deletedUser.email, deletedUser.auth, deletedUser.firstName, deletedUser.lastName, deletedUser.secondName);
    }

    return user;
}

export async function updateUser(emailToUpdate: string, updatedUser: UpdatedUserI ): Promise<User | undefined> {
    let user: User | undefined = undefined;

    if(updatedUser.updatedPassword){
        updatedUser.updatedPassword = await bcrypt.hash(updatedUser.updatedPassword, parseInt(process.env.SALT_ROUNDS as string));
    }

    const matchedUser = await updateNode(NodeType.USER, `u`, `email`, updatedUserToProps(updatedUser), { email: emailToUpdate, ... updatedUser }, (process.env.USERS_DB as string));

    if(matchedUser) {
        user = new User(matchedUser.email, matchedUser.auth, matchedUser.firstName, matchedUser.lastName, matchedUser.secondName);
    }

    return user;
}

function updatedUserToProps(updatedUser: UpdatedUserI): string[]{
    const props: string[] = [];

    if(updatedUser.updatedEmail) props.push(`u.email = $updatedEmail`);
    if(updatedUser.updatedFirstName) props.push(`u.firstName = $updatedFirstName`);
    if(updatedUser.updatedLastName) props.push(`u.lastName = $updatedLastName`);
    if(updatedUser.updatedAuth) props.push(`u.auth = $updatedAuth`);
    if(updatedUser.updatedSecondName) props.push(`u.secondName = $updatedSecondName`);
    if(updatedUser.updatedPassword) props.push(`u.password = $updatedPassword`);

    return props;
}
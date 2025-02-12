import { Auth } from "../auth/authorization";

export class User {
    public email: string;
    public firstName: string;
    public secondName: string;
    public lastName: string;
    public auth: Auth;

    constructor(email: string, auth: Auth, firstName: string, lastName: string, secondName?: string){
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.secondName = secondName || '';
        this.auth = auth;
    }
}

export interface UpdatedUserI {
    updatedEmail?: string;
    updatedFirstName?: string;
    updatedSecondName?: string;
    updatedLastName?: string;
    updatedAuth?: string;
    updatedPassword?: string;
}
import { Auth } from "../auth/authorization";

export class User {
    private _email: string;
    private _firstName: string;
    private _secondName: string;
    private _lastName: string;
    private _auth: Auth;

    constructor(email: string, auth: Auth, firstName: string, lastName: string, secondName?: string){
        this._email = email;
        this._firstName = firstName;
        this._lastName = lastName;
        this._secondName = secondName || '';
        this._auth = auth;
    }

    getEmail(): string {
        return this._email;
    }

    getFirstName(): string {
        return this._firstName
    }

    getLastName(): string {
        return this._lastName;
    }

    getSecondName(): string {
        return this._secondName;
    }

    getAuth(): Auth {
        return this._auth;
    }
}
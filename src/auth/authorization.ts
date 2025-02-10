export enum Auth {
    ADMIN = 'admin',
    CONTRIBUTOR = 'contributor'
}

export class AuthorizedUser {
    public email: string;
    public auth: Auth;

    constructor(email: string, auth: Auth){
        this.email = email;
        this.auth = auth;
    }
}
export enum Auth {
	ADMIN = 'ADMIN',
	CONTRIBUTOR = 'CONTRIBUTOR',
}

export class AuthorizedUser {
	public id: string;
	public email: string;
	public auth: Auth;

	constructor(email: string, auth: Auth, id: string) {
		this.email = email;
		this.auth = auth;
		this.id = id;
	}
}

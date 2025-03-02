export enum Auth {
	ADMIN = 'admin',
	CONTRIBUTOR = 'contributor',
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

export function isPermitted(authorizedUser: AuthorizedUser | undefined, ...rolesPermitted: Auth[]): boolean {
	if (!authorizedUser) return false;
	return rolesPermitted.includes(authorizedUser.auth);
}

export function permitSelf(authorizedUser: AuthorizedUser | undefined, emailQuery: string): boolean {
	if (!authorizedUser) return false;
	return authorizedUser.email === emailQuery;
}

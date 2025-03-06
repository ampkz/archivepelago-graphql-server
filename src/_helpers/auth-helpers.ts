import jwt, { Secret } from 'jsonwebtoken';
import { Auth, AuthorizedUser } from '../auth/authorization';

export function signToken(email: string, auth: Auth, authToken: string, expiresIn: any): string {
	const SECRET_KEY: Secret = process.env.TOKEN_SECRET as string;
	return jwt.sign({ email, auth, authToken }, SECRET_KEY, { expiresIn });
}

export function verifyToken(token: any): { user: AuthorizedUser | undefined; authToken: string | undefined } {
	const SECRET_KEY: Secret = process.env.TOKEN_SECRET as string;

	let user: AuthorizedUser | undefined = undefined;
	let authToken: string | undefined = undefined;

	jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
		if (decoded) {
			user = new AuthorizedUser(decoded.email, decoded.auth, '');
			authToken = decoded.authToken;
		}
	});

	return { user, authToken };
}

export function isPermitted(authorizedUser: AuthorizedUser | undefined, ...rolesPermitted: Auth[]): boolean {
	if (!authorizedUser) return false;
	return rolesPermitted.includes(authorizedUser.auth);
}

export function permitSelf(authorizedUser: AuthorizedUser | undefined, emailQuery: string): boolean {
	if (!authorizedUser) return false;
	return authorizedUser.email === emailQuery;
}

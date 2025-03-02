import jwt, { Secret } from 'jsonwebtoken';
import { Auth, AuthorizedUser } from '../auth/authorization';

export function signToken(email: string, auth: Auth, expiresIn: any): string {
	const SECRET_KEY: Secret = process.env.TOKEN_SECRET as string;
	return jwt.sign({ email, auth }, SECRET_KEY, { expiresIn });
}

export function verifyToken(token: any): AuthorizedUser | undefined {
	const SECRET_KEY: Secret = process.env.TOKEN_SECRET as string;

	let user: AuthorizedUser | undefined = undefined;

	jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
		if (decoded) {
			user = new AuthorizedUser(decoded.email, decoded.auth, '');
		}
	});

	return user;
}

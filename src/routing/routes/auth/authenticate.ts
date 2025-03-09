import { Request, Response, NextFunction } from 'express';
import { FieldError, FieldErrors, RoutingErrors } from '../../../_helpers/errors-helper';
import { User } from '../../../users/users';
import { checkPassword } from '../../../db/users/authenticate-user';
import { sendStatus401 } from '../../../middleware/statusCodes';
import { createSession, generateSessionToken, invalidateSession, validateSessionToken } from '../../../auth/session';
import { signToken, verifyToken } from '../../../_helpers/auth-helpers';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<any> {
	const { email, password } = req.body;

	const required: FieldErrors = new FieldErrors(RoutingErrors.INVALID_REQUEST);

	if (!email) required.addFieldError(new FieldError('email', FieldError.REQUIRED));
	if (!password) required.addFieldError(new FieldError('password', FieldError.REQUIRED));

	if (required.hasFieldErrors()) {
		return next(required);
	}

	const user: User | undefined = await checkPassword(email, password);

	if (user === undefined) {
		return sendStatus401(res);
	}

	const token = generateSessionToken();

	await createSession(token, email);

	const jwt = signToken(user.email, user.auth, token, process.env.TOKEN_EXPIRATION);

	return (
		res
			.status(204)
			// .cookie('token', token, {
			// 	httpOnly: true,
			// 	maxAge: Number(process.env.COOKIE_EXPIRATION),
			// 	sameSite: 'strict',
			// })
			.cookie('jwt', jwt, {
				httpOnly: true,
				maxAge: Number(process.env.COOKIE_EXPIRATION),
				sameSite: 'strict',
			})
			.end()
	);
}

export async function logout(req: Request, res: Response) {
	const jwt = req.cookies.jwt;

	if (!jwt) {
		return res.status(204).end();
	}

	const { authToken } = verifyToken(jwt);
	const svr = await validateSessionToken(authToken);
	if (svr.session) {
		await invalidateSession(svr.session.id);
	}

	return res.status(204).clearCookie('jwt').end();
}

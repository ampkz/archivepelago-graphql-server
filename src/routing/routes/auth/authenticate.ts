import { Request, Response, NextFunction } from 'express';
import { FieldError, FieldErrors, RoutingErrors } from '../../../_helpers/errors-helper';
import { User } from '../../../users/users';
import { checkPassword } from '../../../db/users/authenticate-user';
import { sendStatus401 } from '../../../middleware/statusCodes';
import { signToken } from '../../../_helpers/auth-helpers';

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

	return res
		.status(204)
		.cookie('jwt', signToken(user.email, user.auth, process.env.TOKEN_EXPIRATION), {
			httpOnly: true,
			maxAge: Number(process.env.COOKIE_EXPIRATION),
			sameSite: 'strict',
		})
		.end();
}

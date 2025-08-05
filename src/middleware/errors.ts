import { NextFunction, Response, Request } from 'express';
import { CustomError } from '@ampkz/auth-neo4j/errors';

/* istanbul ignore next line */
// eslint-disable-next-line
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	let code: number = 422;

	if (err instanceof CustomError) {
		code = (err as CustomError).getCode();
		// data = (err as CustomError).getData();
	}

	return res.status(code).json({ message: err.message });
};

export function error404(req: Request, res: Response, next: NextFunction) {
	const error: CustomError = new CustomError('Not Found', 404);
	next(error);
}

import { NextFunction, Response, Request } from 'express';
import { CustomError } from '@ampkz/auth-neo4j/errors';
import logger from '@ampkz/auth-neo4j/logger';

/* istanbul ignore next line */
// eslint-disable-next-line
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	const host = req.headers['host'] || '';
	const userAgent = req.headers['user-agent'] || '';

	let code: number = 500;

	if (err.constructor.prototype.getCode) {
		code = (err as CustomError).getCode();
	}

	if (code >= 500) {
		logger.error(`Internal Server Error: ${err.message}`, {
			cause: err.cause,
			host,
			userAgent,
		});
	} else if (code < 500 && code >= 400) {
		logger.warn(`Client Error: ${err.message}`, {
			cause: err.cause,
			host,
			userAgent,
		});
	} else {
		logger.info(`Error: ${err.message}`, {
			cause: err.cause,
			host,
			userAgent,
		});
	}

	return res.status(code).json({ message: err.message });
};

export function error404(req: Request, res: Response, next: NextFunction) {
	const error: CustomError = new CustomError('Not Found', 404, { cause: { url: req.url, method: req.method } });
	next(error);
}

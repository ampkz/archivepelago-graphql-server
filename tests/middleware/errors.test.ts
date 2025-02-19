import { error404 } from '../../src/middleware/errors';
import { Response, Request } from 'express';

describe(`Middleware Errors Test`, () => {
	it('should send a 404 error', () => {
		const req = {} as Request,
			res = {} as Response,
			next = jest.fn();

		error404(req, res, next);

		expect(next).toHaveBeenCalled();
	});
});

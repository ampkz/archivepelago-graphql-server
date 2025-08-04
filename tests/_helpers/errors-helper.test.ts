import { CustomError, InternalError } from '../../src/_helpers/errors-helper';

describe(`Errors helper tests`, () => {
	it('should create a custom Error with a code and data', () => {
		{
			const message: string = 'Error Message',
				code: number = 0,
				data: any = { customData: 'customData' };

			const customError: CustomError = new CustomError(message, code, data);

			expect(customError.message).toEqual(message);
			expect(customError.getCode()).toEqual(code);
			expect(customError.getData()).toEqual(data);
			expect(customError.toJSON()).toEqual({ message, data });
		}
	});

	it('should create an InternalError with code 500', () => {
		const message: string = 'Error Message',
			data: any = { customData: 'customData' };

		const internalError: InternalError = new InternalError(message, data);

		expect(internalError.message).toEqual(message);
		expect(internalError.getCode()).toEqual(500);
		expect(internalError.getData()).toEqual(data);
	});
});

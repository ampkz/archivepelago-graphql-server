import { CustomError, FieldError, FieldErrors, InternalError, ResourceExistsError } from '../../src/_helpers/errors-helper';

describe(`Errors helper tests`, ()=>{
    it('should create a custom Error with a code and data', () => {{
        const message: string = 'Error Message',
            code: number = 0,
            data: any = { customData: 'customData' };

        const customError: CustomError = new CustomError(message, code, data);

        expect(customError.message).toEqual(message);
        expect(customError.getCode()).toEqual(code);
        expect(customError.getData()).toEqual(data);
        expect(customError.toJSON()).toEqual({message, data});
    }});

    it('should create an InternalError with code 500', () => {
        const message: string = 'Error Message',
            data: any = { customData: 'customData' };

        const internalError: InternalError = new InternalError(message, data);

        expect(internalError.message).toEqual(message);
        expect(internalError.getCode()).toEqual(500);
        expect(internalError.getData()).toEqual(data);
    });

    it('should create a ResourcesExistsError with code 409', () => {
        const message: string = 'Error Message',
            data: any = { customData: 'customData' };

        const resourceExistsError: ResourceExistsError = new ResourceExistsError(message, data);

        expect(resourceExistsError.message).toEqual(message);
        expect(resourceExistsError.getCode()).toEqual(409);
        expect(resourceExistsError.getData()).toEqual(data);
    });

    it('should create a FieldError', () => {
        const field: string = 'email',
            message: string = FieldError.REQUIRED;
        
        const fieldError: FieldError = new FieldError(field, message);

        expect(fieldError.getField()).toEqual(field);
        expect(fieldError.getMessage()).toEqual(message);
        expect(fieldError.toJSON()).toEqual({ field, message });

    });

    it('should create a FieldErrors with code 400', () => {
        const message: string = '',
            data: any = { customData: 'customData' };
        
        const fieldErrors: FieldErrors = new FieldErrors(message, data);

        expect(fieldErrors.message).toEqual(message);
        expect(fieldErrors.getCode()).toEqual(400);
        expect(fieldErrors.getData().customData).toEqual(data.customData);
        expect(fieldErrors.hasFieldErrors()).toBeFalsy();
    });

    test('FieldErrors should return an array of FieldError in its getData method', () => {
        const message: string = '',
            data: any = { customData: 'customData' },
            fieldError1: FieldError = new FieldError('email', FieldError.REQUIRED),
            fieldError2: FieldError = new FieldError('password', FieldError.REQUIRED);
        
        const fieldErrors: FieldErrors = new FieldErrors(message, data);
        fieldErrors.addFieldError(fieldError1);
        fieldErrors.addFieldError(fieldError2);

        expect(fieldErrors.message).toEqual(message);
        expect(fieldErrors.getCode()).toEqual(400);
        expect(fieldErrors.getData().customData).toEqual(data.customData);
        expect(fieldErrors.getData().fields).toContainEqual(fieldError1.toJSON());
        expect(fieldErrors.getData().fields).toContainEqual(fieldError2.toJSON());
        expect(fieldErrors.hasFieldErrors()).toBeTruthy();
    });
});
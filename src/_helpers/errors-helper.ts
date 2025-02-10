export class CustomError extends Error {
    constructor(message: string, code: number, data?: any) {
        super(message, { cause: { code, data } });
    }

    getCode(): number {
        return (this.cause as any).code;
    }

    getData(): any {
        return (this.cause as any).data;
    }

    toJSON() {
        return {message: this.message, data: this.getData()};
    }
}

export class InternalError extends CustomError {
    constructor(message: string, data?: any){
        super(message, 500, data);
    }
}

export class ResourceExistsError extends CustomError {
    constructor(message: string, data?: any){
        super(message, 409, data);
    }
}

export enum RoutingErrors {
    INVALID_REQUEST = 'Invalid Request',
}

export class FieldError {
    static REQUIRED: string = 'Required';
    
    private _field: string;
    private _message: string;

    constructor(field: string, message: string){
        this._field = field;
        this._message = message;
    }

    getField(): string {
        return this._field;
    }

    getMessage(): string {
        return this._message;
    }

    toJSON() {
        return { field: this.getField(), message: this.getMessage() };
    }
}

export class FieldErrors extends CustomError {
    private _fieldErrors: Array<FieldError> = [];
    
    constructor(message: string, data?: any){
        super(message, 400, data);
    }

    addFieldError(fieldError: FieldError){
        this._fieldErrors.push(fieldError);
    }

    hasFieldErrors(): boolean {
        return this._fieldErrors.length > 0;
    }

    getData() {
        const fields: any[] = [];
        for(const fieldError of this._fieldErrors){
            fields.push(fieldError.toJSON());
        }
        return {... (this.cause as any).data, fields};
    }
}
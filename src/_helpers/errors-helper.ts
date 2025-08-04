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
		return { message: this.message, data: this.getData() };
	}
}

export class InternalError extends CustomError {
	constructor(message: string, data?: any) {
		super(message, 500, data);
	}
}

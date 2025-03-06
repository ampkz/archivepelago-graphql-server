import { GraphQLError } from 'graphql';

export enum Errors {
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',
	MUTATION_FAILED = 'MUTATION_FAILED',
	SERVER_ERROR = 'SERVER_ERROR',
	INVALID_EMAIL = 'INVALID_EMAIL',
	BAD_USER_INPUT = 'BAD_USER_INPUT',
}

export enum Error_Msgs {
	ENTER_VALID_EMAIL = 'Please enter a valid email address.',
}

export function notFoundError(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: Errors.NOT_FOUND } });
}

export function unauthorizedError(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: Errors.UNAUTHORIZED } });
}

export function mutationFailed(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: Errors.MUTATION_FAILED } });
}

export function serverFailed(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: Errors.SERVER_ERROR } });
}

export function invalidEmail(): GraphQLError {
	return new GraphQLError(Error_Msgs.ENTER_VALID_EMAIL, { extensions: { code: Errors.INVALID_EMAIL } });
}

import { GraphQLError } from 'graphql';

export enum Errors {
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',
	MUTATION_FAILED = 'MUTATION_FAILED',
	SERVER_ERROR = 'SERVER_ERROR',
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

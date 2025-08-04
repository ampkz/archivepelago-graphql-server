import { GraphQLError } from 'graphql';

export enum Errors {
	UNAUTHORIZED = 'UNAUTHORIZED',
	MUTATION_FAILED = 'MUTATION_FAILED',
	SERVER_ERROR = 'SERVER_ERROR',
	BAD_USER_INPUT = 'BAD_USER_INPUT',
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

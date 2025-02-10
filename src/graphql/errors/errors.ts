import { GraphQLError } from "graphql";

export enum Errors {
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
}

export function notFoundError(message: string): GraphQLError {
    return new GraphQLError(message, { extensions: { code: Errors.NOT_FOUND }});
}

export function unauthorizedError(message: string): GraphQLError {
    return new GraphQLError(message, { extensions: { code: Errors.UNAUTHORIZED }});
}
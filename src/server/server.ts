import { ApolloServer } from '@apollo/server';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Express } from 'express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { error404, errorHandler } from '../middleware/errors';
import authenticateRouter from '../routing/auth/authenticate';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import { AuthorizedUser } from '../auth/authorization';
import { verifyToken } from '../_helpers/auth-helpers';
import userType from '../graphql/typeDefs/userType';
import userResolver from '../graphql/resolvers/userResolver';


interface MyContext {
    authorizedUser?: AuthorizedUser | undefined;
}

async function startServer() {
    const app: Express = express();
    
    const httpServer = http.createServer(app);
    
    const typeDefs = mergeTypeDefs([userType]);
    const resolvers = mergeResolvers([userResolver]);

    const server = new ApolloServer<MyContext>({
        typeDefs,
        resolvers,
        includeStacktraceInErrorResponses: (process.env.NODE_ENV === 'test' ? true : false),
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();
    app.use(cors<cors.CorsRequest>());
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/graphql', expressMiddleware(server, {context: async ({ req }) => ({ authorizedUser: verifyToken(req.cookies.jwt) })}));

    app.use(authenticateRouter);

    app.use(error404);
    
    app.use(errorHandler);

    return app;
}

export default startServer;
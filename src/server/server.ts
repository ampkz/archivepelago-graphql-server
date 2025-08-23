import { ApolloServer } from '@apollo/server';
import { mergeResolvers } from '@graphql-tools/merge';
import { expressMiddleware } from '@as-integrations/express5';
import express, { Express } from 'express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { error404, errorHandler } from '../middleware/errors';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
// import personType from '../graphql/typeDefs/personType';
import personResolver from '../graphql/resolvers/personResolver';
// import labelType from '../graphql/typeDefs/labelType';
import labelResolver from '../graphql/resolvers/labelResolver';
// import correspondenceType from '../graphql/typeDefs/correspondenceType';
import correspondenceResolver from '../graphql/resolvers/correspondenceResolver';
import helmet from 'helmet';
import authNeo4j from '@ampkz/auth-neo4j';
import { validateSessionToken } from '@ampkz/auth-neo4j/token';
import { User } from '@ampkz/auth-neo4j/user';
import rateLimit from 'express-rate-limit';
import { readFileSync } from 'fs';
import path from 'path';

export interface MyContext {
	authorizedUser?: User | null;
}

async function startServer() {
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per windowMs
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		message: 'Too many requests from this IP, please try again later.',
	});

	const app: Express = express();

	const httpServer = http.createServer(app);

	const parentPath = path.dirname(__dirname);

	// const typeDefs = mergeTypeDefs([personType, labelType, correspondenceType]);
	let typeDefs = readFileSync(parentPath + '/graphql/schema/schema.graphql', { encoding: 'utf-8' });
	typeDefs += readFileSync(parentPath + '/graphql/schema/correspondenceSchema.graphql', { encoding: 'utf-8' });
	typeDefs += readFileSync(parentPath + '/graphql/schema/personSchema.graphql', { encoding: 'utf-8' });
	typeDefs += readFileSync(parentPath + '/graphql/schema/labelSchema.graphql', { encoding: 'utf-8' });

	const resolvers = mergeResolvers([personResolver, labelResolver, correspondenceResolver]);

	/* istanbul ignore next line */
	const server = new ApolloServer<MyContext>({
		typeDefs,
		resolvers,
		includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development' ? true : false,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await server.start();

	app.use(helmet());

	/* istanbul ignore next line */
	app.use(
		cors<cors.CorsRequest>({
			origin: `${process.env.NODE_ENV === 'development' ? `http://localhost:3000` : ``}`,
			methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
			credentials: true,
			allowedHeaders: `Content-Type, Authorization, X-Requested-With`,
		})
	);
	app.use(cookieParser());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use(limiter);

	app.use(
		'/graphql',
		expressMiddleware(server, {
			context: async ({ req }) => {
				const token = req.cookies.token;
				const svr = await validateSessionToken(token);
				return { authorizedUser: svr.user };
			},
		})
	);

	app.use(authNeo4j());

	app.use(error404);

	app.use(errorHandler);

	return app;
}

export default startServer;

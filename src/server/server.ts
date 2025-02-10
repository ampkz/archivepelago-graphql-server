import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import express, { Express } from 'express';
import { error404, errorHandler } from '../middleware/errors';
import authenticateRouter from '../routing/auth/authenticate';
import cookieParser from 'cookie-parser';

const app: Express = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticateRouter);

app.use(error404);

app.use(errorHandler);

export default app;
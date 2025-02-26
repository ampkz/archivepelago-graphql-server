import startServer from './server/server';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;

(async () => {
	const app = await startServer();
	app.listen(port, () => {
		console.log(`[server]: Node environment is: ${process.env.NODE_ENV}`);
		console.log(`[server]: Server is running at http://localhost:${port}/`);
		console.log(`[server]: Graphql endpoint at http://localhost:${port}/graphql`);
	});
})();

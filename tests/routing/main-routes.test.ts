import request from 'supertest';
import startServer from '../../src/server/server';

describe(`Main Routes Tests`, () => {
	let app: any;

	beforeAll(async () => {
		app = await startServer();
	});

	it('should send 404 on an undefined route', async () => {
		await request(app)
			.get('/404error')
			.expect(404)
			.then(response => {
				expect(response.body.message).toEqual('Not Found');
			});
	});
});

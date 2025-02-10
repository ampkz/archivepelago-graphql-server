import request from 'supertest';
import app from '../../src/server/server';

describe(`Main Routes Tests`, () => {

    it('should send 404 on an undefined route', async () => {
        request(app)
            .get('/404error')
            .expect(404)
            .then(response => {
                expect(response.body.message).toEqual('Not Found');
            });
    })
});
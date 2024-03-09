const request = require('supertest');
const app = require('../app');

describe('GET /watchlist/get-watchlist', () => {
  it('Gets the watchlist for profileId 57 successfully', async () => {

    const response = await request(app).get('/watchlist/get-watchlist?profileId=57');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toBeInstanceOf(Array);
  });
});


describe('GET /watchlist/get-watchlist', () => {
  it('Handles invalid data', async () => {

    const response = await request(app).get('/watchlist/get-watchlist?profileId=invalidData');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid data, profileId must be a number' });
  });
});

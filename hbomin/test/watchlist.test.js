const request = require('supertest');
const app = require('../app'); 

describe('POST /watchlist/get-watchlist/', () => {
  it('Gets the watchlist for profileId 57 successfully', async () => {
    const response = await request(app)
      .post('/watchlist/get-watchlist/')
      .send({
        profileId: 57,
      });

    expect(response.status).toBe(200);
  });

  it('Handles invalid data', async () => {
    const response = await request(app)
      .post('/watchlist/get-watchlist/')
      .send({
        // Invalid data, missing required fields
      });

    expect(response.status).toBe(500);
  });
});

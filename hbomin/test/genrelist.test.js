const request = require('supertest');
const app = require('../app'); 


describe('GET /genre/genrelist', () => {
  it('Responds with status 200', async () => {
    const response = await request(app).get('/genre/genrelist');
    expect(response.status).toBe(200);
  });

  it('Responds with JSON containing a list of genres', async () => {
    const response = await request(app).get('/genre/genrelist');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    
    expect(Array.isArray(response.body.results)).toBe(true);
  });
});

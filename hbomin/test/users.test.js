const jwt = require('jsonwebtoken');
const { loginAndGetToken } = require('./generate-sample-token');

const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  authToken = await loginAndGetToken();
});

// Daily income Date with actual incomes
describe('GET /users', () => {
  it('Respons with a 401 unauthorized code', async () => {
    const response = await request(app)
      .get('/users');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Respons with a 403 unknown / forbidden token', async () => {
    const response = await request(app)
      .get('/users')
      .set('authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15X3VzZXIiLCJwYXNzd29yZCI6InRlc3QxMjM0IiwiaWF0IjoxNjQ3NjQ0ODg2LCJleHAiOjE2NDc2NDg0ODZ9.VANXb8hjazOCvyC-C6YReHtrKqH5C06RY5VusWnJXfI`);


    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });

  it('Responds with an error for no income', async () => {
    const response = await request(app)
      .get('/users')
      .set('authorization', `Bearer ${authToken}`);


    expect(response.status).toBe(200);
  });
});


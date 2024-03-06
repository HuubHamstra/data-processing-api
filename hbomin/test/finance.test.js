const jwt = require('jsonwebtoken');
const { loginAndGetToken } = require('./generate-test-token');

const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  authToken = await loginAndGetToken();
});

// Daily income Date with actual incomes
describe('GET /finance/daily-income?date=2024-01-21T14:55:40.483Z', () => {
  it('Responds with today\'s income', async () => {
    // Set the authorization header with the JWT token
    const response = await request(app)
      .get('/finance/daily-income?date=2024-01-21T22:42:23.740Z')
      .set('authorization', `Bearer ${authToken}`); 

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dailyIncome');
    expect(typeof response.body.dailyIncome).toBe('number');
    expect(response.body.dailyIncome).toBeGreaterThan(0);
  });

  it('Responds with an error for no income', async () => {
    const response = await request(app)
      .get('/finance/daily-income?date=2024-01-01T22:42:23.740Z')
      .set('authorization', `Bearer ${authToken}`); 


    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid or missing daily income value');
  });

  // Send request without token
  it('Responds with 401 unauthorized', async () => {
    const response = await request(app)
      .get('/finance/daily-income?date=2024-01-01T22:42:23.740Z');


    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Responds with 403 forbidden - Invalid token', async () => {
    const response = await request(app)
    .get('/finance/daily-income?date=2024-01-01T22:42:23.740Z')
    .set('authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15X3VzZXIiLCJwYXNzd29yZCI6InRlc3QxMjM0IiwiaWF0IjoxNjQ3NjQ0ODg2LCJleHAiOjE2NDc2NDg0ODZ9.VANXb8hjazOCvyC-C6YReHtrKqH5C06RY5VusWnJXfI`); 


    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
});

// Get total income
describe('GET /finance/total-income', () => {
  it('Responds with total income', async () => {
    const response = await request(app)
      .get('/finance/total-income')
      .set('authorization', `Bearer ${authToken}`); 

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalIncome');
    expect(typeof response.body.totalIncome).toBe('number');
    expect(response.body.totalIncome).toBeGreaterThanOrEqual(0);
  });

  it('Responds with 401 unauthorized', async () => {
    const response = await request(app)
      .get('/finance/total-income');


    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Responds with 403 forbidden - Invalid token', async () => {
    const response = await request(app)
      .get('/finance/total-income')
      .set('authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15X3VzZXIiLCJwYXNzd29yZCI6InRlc3QxMjM0IiwiaWF0IjoxNjQ3NjQ0ODg2LCJleHAiOjE2NDc2NDg0ODZ9.VANXb8hjazOCvyC-C6YReHtrKqH5C06RY5VusWnJXfI`); 


    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
});

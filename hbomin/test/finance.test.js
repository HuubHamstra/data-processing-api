const request = require('supertest');
const app = require('../app'); 

// Daily income Date with actual incomes
describe('GET /finance/daily-income?date=2024-01-21T14:55:40.483Z', () => {
  it('Responds with today\'s income', async () => {
    const response = await request(app).get('/finance/daily-income?date=2024-01-21T22:42:23.740Z');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dailyIncome');
    expect(typeof response.body.dailyIncome).toBe('number'); // Check if dailyIncome is a number
    expect(response.body.dailyIncome).toBeGreaterThan(0); // Check if dailyIncome is greater than zero
  });
});

//Daily income Date with no incomes'
describe('GET /finance/daily-income?date=2024-01-01T22:42:23.740Z', () => {
  it('Responds with an error for no income', async () => {
    const response = await request(app).get('/finance/daily-income?date=2024-01-01T22:42:23.740Z');

    expect(response.status).toBe(500); // Check if the status code is 500 for an internal server error
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid or missing daily income value');
  });
});

// Get total income
describe('GET /finance/total-income', () => {
  it('Responds with total income', async () => {
    const response = await request(app).get('/finance/total-income');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalIncome');
    expect(typeof response.body.totalIncome).toBe('number');
    expect(response.body.totalIncome).toBeGreaterThanOrEqual(0);
  });
});

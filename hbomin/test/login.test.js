const request = require('supertest');
const app = require('../app');

describe('POST /login', () => {
    
  // Successfull login
  it('Logs in successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@test.test',
        password: 'test',
        accept: 'application/json',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  // Invalid password
  it('Returns 401 for invalid password', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@test.test',
        password: 'wrongPass',
        accept: 'application/json',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  // Invalid email
  it('Return 401 for invalid email', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'malformedemail', 
        password: 'test',
        accept: 'application/json',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  // Invalid email
  it('Return 401 for invalid data (missing password)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'malformedemail', 
        accept: 'application/json',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  it('Return 401 for invalid data (missing email)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        password: 'test',
        accept: 'application/json',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  it('Return 400 for invalid data (only accept header)', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        accept: 'application/json'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data, body data should be present');
  });

  // Empty request body
  it('Return 400 for empty request body', async () => {
    const response = await request(app)
      .post('/login');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data');
  });
});

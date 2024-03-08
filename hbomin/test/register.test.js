const request = require('supertest');
const app = require('../app'); 

describe('POST /register', () => {
    
  it('Registers a new user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fullname: 'Test Account ',
        email: 'test@test.test',
        password: 'test',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('Returns 400 for missing password', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fullname: 'Test Account ',
        email: 'test@test.test',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');

  });

  it('Returns 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fullname: 'Test Account',
        email: 'invalid-email-format', 
        password: 'test',
      });
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email format');
  });
  
  it('Returns 400 for invalid data / empty body', async () => {
    const response = await request(app)
      .post('/register');
  
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data, body data should be present');
  });
  
});
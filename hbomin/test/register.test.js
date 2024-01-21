const request = require('supertest');
const app = require('../app'); 

describe('POST /register', () => {
    
  it('Registers a new user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        accept: 'application/json',
        fullname: 'Test Account ',
        email: 'test@test.test',
        password: 'test',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('Returns 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        accept: 'application/json',
        fullname: 'Test Account',
        email: 'invalid-email-format', 
        password: 'test',
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid email format');
  });
  
});
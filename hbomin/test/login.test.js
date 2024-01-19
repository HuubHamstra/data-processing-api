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
    expect(response.body).toHaveProperty('message', 'Invalid username or password');
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
    expect(response.body).toHaveProperty('message', 'Invalid username or password');
  });
});

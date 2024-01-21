const request = require('supertest');
const app = require('../app'); 

describe('POST /subscription/update-subscription', () => {
    it('Updates subscription successfully', async () => {
      const response = await request(app)
        .post('/subscription/update-subscription')
        .send({
          accountId: 57, // Dummy profile id
          subscriptionId: 1,
          accept: 'application/json',
        });
  
      expect(response.status).toBe(200);
    });
    
    it('Throws error for invalid data', async () => {
        const response = await request(app)
          .post('/subscription/update-subscription')
          .send({
            accountId: 57, // Dummy profile id
            accept: 'application/json',
          });
    
        expect(response.status).toBe(500);
    });
});
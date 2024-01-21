const request = require('supertest');
const app = require('../app');

// ------------------------
// Invite New Member
// ------------------------
describe('POST /account/invite-new-member', () => {
  it('Sends an invitation email successfully', async () => {
    const response = await request(app)
      .post('/account/invite-new-member')
      .send({
        profileName: 'Test Profile',
        recipient: 'kevinstenden1@gmail.com'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Email sent successfully');
  });

  it('Returns a error for invalid email', async () => {
    const response = await request(app)
      .post('/account/invite-new-member')
      .send({
        profileName: 'Test Profile',
        recipient: 'not-a-mail'
      });

    expect(response.status).toBe(500);
  }, 10000);
});

// ------------------------
// Reset password
// ------------------------
describe('POST /account/reset-password', () => {
    it('Sends a password reset email successfully', async () => {
      const response = await request(app)
        .post('/account/reset-password')
        .send({
          email: 'kevinstenden1@gmail.com',
        });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('Returns error for invalid email', async () => {
        const response = await request(app)
          .post('/account/reset-password')
          .send({
            email: 'invalid-mail',
          });
    
        expect(response.status).toBe(500);
      });
});

// ------------------------
// Create profile
// ------------------------
describe('POST /account/create-profile', () => {
    it('Creates a new profile successfully', async () => {
      const response = await request(app)
        .post('/account/create-profile')
        .send({
          accountId: 57, // Dummy Profile ID
          profileName: 'Profile 1',
          profileImage: 'https://example.com/avatar.jpg',
          age: 25,
          language: 1,
          viewMovies: 1,
          viewSeries: 1,
          minAge: 18,
          accept: 'application/json',
        });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profile');
    });

    it('Throws error posting without data', async () => {
        const response = await request(app)
          .post('/account/create-profile')
          .send({

          });
    
        expect(response.status).toBe(500);
      });
});

// ------------------------
// Update Profile
// ------------------------
describe('POST /account/update-profile', () => {
    it('Updates a profile successfully', async () => {
      const response = await request(app)
        .post('/account/update-profile')
        .send({
          accountId: 57,
          profileName: 'Update Profile Name',
          profileImage: 'https://example.com/updated-avatar.jpg',
          age: 30,
          accept: 'application/json',
        });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profile');
    });

    it('Throws error posting without data', async () => {
        const response = await request(app)
          .post('/account/update-profile')
          .send({
          });
    
        expect(response.status).toBe(500);
      });
});
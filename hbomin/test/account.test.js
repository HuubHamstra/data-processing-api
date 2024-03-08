const request = require('supertest');
const app = require('../app');
const e = require('express');

// ------------------------
// Invite New Member
// ------------------------
describe('POST /account/invite-new-member', () => {
  it('Sends an invitation email successfully', async () => {
    const response = await request(app)
      .post('/account/invite-new-member')
      .send({
        profileName: 'Test Profile',
        url: 'https://example.com/invite',
        recipient: 'kevinstenden1@gmail.com'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Email sent successfully');
  });

  it('Returns a error for invalid email', async () => {
    const response = await request(app)
      .post('/account/invite-new-member')
      .send({
        profileName: 'Test Profile',
        recipient: 'not-a-mail'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data, email is not valid');
  }, 10000);
  
  it('Returns a error for invalid email / Empty mail', async () => {
    const response = await request(app)
      .post('/account/invite-new-member')
      .send({
        profileName: 'Test Profile'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data, email is not valid');
  }, 10000);
  
  it('Returns error for empty body', async () => {
    const response = await request(app)
      .post('/account/invite-new-member');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data, body data should be present');
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

    it('Returns error for empty body', async () => {
      const response = await request(app)
        .post('/account/reset-password')
        .send({
        });
  
      expect(response.status).toBe(400);
    });

    it('Returns error for invalid email', async () => {
        const response = await request(app)
          .post('/account/reset-password')
          .send({
            email: 'invalid-mail',
          });
    
        expect(response.status).toBe(400);
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
        });
  
      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('profile');
    });

    it('Throws error for missing required fields', async () => {
      const response = await request(app)
        .post('/account/create-profile')
        .send({
          accountId: 57, // Dummy Profile ID
          age: 25,
          language: 1,
          viewMovies: 1,
          viewSeries: 1,
          minAge: 18,
        });
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields')
    });

    it('Throws error posting without data / missing required fields', async () => {
        const response = await request(app)
          .post('/account/create-profile')
          .send({

          });
    
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields')
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
        });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profile');
    });

    it('Throws error posting without data', async () => {
        const response = await request(app)
          .post('/account/update-profile')
          .send({
          });
    
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid data, body data should be present')
      });
});
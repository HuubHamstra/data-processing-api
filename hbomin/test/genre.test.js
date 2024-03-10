const jwt = require('jsonwebtoken');
const { loginAndGetToken } = require('./generate-sample-token');

const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  authToken = await loginAndGetToken();
});

describe('GET /genre/genrelist', () => {
  // Respond with status code 200
  it('Responds with status 200', async () => {
    const response = await request(app).get('/genre/genrelist');
    expect(response.status).toBe(200);
  });

  it('Responds with status code 200 in xml format', async () => {
    const response = await request(app).get('/genre/genrelist')
      .set('accept', 'application/xml');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch('application/xml')
  });

  // Check actual response
  it('Responds with containing a list of genres', async () => {
    const response = await request(app).get('/genre/genrelist');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(0);

    const genreList = response.body;
    expect(Array.isArray(genreList)).toBe(true);

    genreList.forEach(genre => {
      expect(typeof genre.title).toBe('string');
      expect(typeof genre.description).toBe('string');
    });
  });
});

describe('POST /genre/create-genre', () => {
  it('Creates a new genre successfully', async () => {
    const newGenre = {
      title: 'Action',
      description: 'Intense action scenes'
    };

    const response = await request(app)
      .post('/genre/create-genre')
      .send(newGenre)
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('genre');
  });

  it('Returns 401 unauthorized for missing token', async () => {
    const response = await request(app)
      .post('/genre/create-genre')
      .send({
        title: 'Action',
        description: 'Intense action scenes'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Returns 403 unauthorized for invalid token', async () => {
    const response = await request(app)
      .post('/genre/create-genre')
      .send({
        title: 'Action',
        description: 'Intense action scenes'
      })
      .set('authorization', `Bearer invalidToken`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
  });

  it('Returns 400 when missing required fields', async () => {
    const response = await request(app)
      .post('/genre/create-genre')
      .send({
        description: 'Intense action scenes'
      })
      .set('authorization', `Bearer ${authToken}`);
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Missing required fields in request body');
  });

  it('Returns 400 when data validation fails', async () => {
    const response = await request(app)
      .post('/genre/create-genre')
      .send({
        title: 'Action',
        description: 12345 
      })
      .set('authorization', `Bearer ${authToken}`);
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a string');
  });
});

describe('POST /genre/update-genre', () => {
  it('Updates a genre successfully', async () => {
    const updateData = {
      genreId: 1,
      title: 'Updated Genre Title',
      description: 'Updated genre description'
    };

    const response = await request(app)
      .post('/genre/update-genre')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('genre');
    expect(response.body.genre).toBe("Genre successfully updated");
  });

  it('Returns 400 when genreId is missing', async () => {
    const updateData = {
      title: 'Updated Genre Title',
      description: 'Updated genre description'
    };

    const response = await request(app)
      .post('/genre/update-genre')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });

  it('Returns 400 when data validation fails', async () => {
    const updateData = {
      genreId: 1,
      title: 12345, // Passing a non-string value for title
      description: 'Updated genre description'
    };

    const response = await request(app)
      .post('/genre/update-genre')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a string');
  });

    it('Returns 401 unauthorized for missing token', async () => {
    const response = await request(app)
      .post('/genre/update-genre')
      .send({
        genreId: 1,
        title: 'Updated Genre Title',
        description: 'Updated genre description'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Returns 403 forbidden for invalid token', async () => {
    const response = await request(app)
      .post('/genre/update-genre')
      .send({
        genreId: 1,
        title: 'Updated Genre Title',
        description: 'Updated genre description'
      })
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
});


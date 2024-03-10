const jwt = require('jsonwebtoken');
const { loginAndGetToken } = require('./generate-sample-token');

const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  authToken = await loginAndGetToken();
});

describe('GET /movie/movietable', () => {
  it('Returns a list of movies successfully. First results genre_title equal to "Action"', async () => {

    const response = await request(app).get('/movie/movietable');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toBeInstanceOf(Array);

    const expectedGenreTitle = 'Comedy';
    expect(response.body.results[0].genre_title).toBe(expectedGenreTitle);
  });

  it('Returns a movietable in xml format', async () => {
    const response = await request(app).get('/movie/movietable')
      .set('accept', 'application/xml');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch('application/xml')
  });
});


describe('GET /movie/movielist', () => {
  it('Returns a movielist where the duration is also present', async () => {

    const response = await request(app).get('/movie/movielist');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toBeInstanceOf(Array);

    expect(typeof response.body.results[0].title).toBe('string');
  });

  it('Returns a movielist in xml format', async () => {
    const response = await request(app).get('/movie/movielist')
      .set('accept', 'application/xml');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch('application/xml')
  });
});

describe('POST /movie/create-movie', () => {
  it('Creates a new movie successfully', async () => {
    const newMovie = {
      title: 'Inception',
      duration: 148,
      description: 'A thief who enters the dreams of others to steal secrets',
      definitionTypeId: 1,
      genreId: 2
    };

    const response = await request(app)
      .post('/movie/create-movie')
      .send(newMovie)
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('movie');
  });

  it('Returns 401 unauthorized for missing jwt token', async () => {
    const newMovie = {
      title: 'Inception',
      duration: 148,
      description: 'A thief who enters the dreams of others to steal secrets',
      definitionTypeId: 1,
      genreId: 2
    };

    const response = await request(app)
      .post('/movie/create-movie')
      .send(newMovie);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Unauthorized');
  });

  it('Returns 403 forbidden for invalid token', async () => {
    const newMovie = {
      title: 'Inception',
      duration: 148,
      description: 'A thief who enters the dreams of others to steal secrets',
      definitionTypeId: 1,
      genreId: 2
    }

    const response = await request(app)
      .post('/movie/create-movie')
      .send(newMovie)
      .set('authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15X3VzZXIiLCJwYXNzd29yZCI6InRlc3QxMjM0IiwiaWF0IjoxNjQ3NjQ0ODg2LCJleHAiOjE2NDc2NDg0ODZ9.VANXb8hjazOCvyC-C6YReHtrKqH5C06RY5VusWnJXfI`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
  });

  it('Returns 400 when missing required fields', async () => {
    const response = await request(app)
      .post('/movie/create-movie')
      .send({
        title: 'Inception',
        description: 'A thief who enters the dreams of others to steal secrets',
        definitionTypeId: 1,
        genreId: 2
      })
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Missing required fields');
  });

  it('Returns 400 when data validation fails', async () => {
    const response = await request(app)
      .post('/movie/create-movie')
      .send({
        title: 'Inception',
        duration: 'Invalid duration',
        description: 'A thief who enters the dreams of others to steal secrets',
        definitionTypeId: 'Invalid type',
        genreId: 'Invalid genre'
      })
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });
});

describe('POST /movie/update-movie', () => {
  it('Updates a movie successfully', async () => {
    const updateData = {
      movieId: 1,
      title: 'Updated Movie Title',
      duration: 150,
      description: 'Updated movie description',
      definitionTypeId: 1,
      genreId: 2
    };

    const response = await request(app)
      .post('/movie/update-movie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('movie');
    expect(response.body.movie).toBe("Movie successfully updated");
  });

  it('Returns 401 unauthorized for missing token', async () => {
    const updateData = {
      movieId: 1,
      title: 'Updated Movie Title',
      duration: 150,
      description: 'Updated movie description',
      definitionTypeId: 1,
      genreId: 2
    };
  
    const response = await request(app)
      .post('/movie/update-movie')
      .send(updateData);
  
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });
  
  it('Returns 403 forbidden for invalid token', async () => {
    const updateData = {
      movieId: 1,
      title: 'Updated Movie Title',
      duration: 150,
      description: 'Updated movie description',
      definitionTypeId: 1,
      genreId: 2
    };
  
    const response = await request(app)
      .post('/movie/update-movie')
      .set('Authorization', 'Bearer invalidToken')
      .send(updateData);
  
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
  

  it('Returns 400 when movieId is missing', async () => {
    const updateData = {
      title: 'Updated Movie Title',
      duration: 150,
      description: 'Updated movie description',
      definitionTypeId: 1,
      genreId: 2
    };

    const response = await request(app)
      .post('/movie/update-movie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });

  it('Returns 400 when data validation fails', async () => {
    const updateData = {
      movieId: 1,
      title: 'Updated Movie Title',
      duration: 'Invalid duration',
      description: 'Updated movie description',
      definitionTypeId: 'Invalid type',
      genreId: 'Invalid genre'
    };

    const response = await request(app)
      .post('/movie/update-movie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });


});

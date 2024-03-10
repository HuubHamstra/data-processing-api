const jwt = require('jsonwebtoken');
const { loginAndGetToken } = require('./generate-sample-token');

const request = require('supertest');
const app = require('../app');

let authToken;

beforeAll(async () => {
  authToken = await loginAndGetToken();
});

describe('GET /serie/serielist', () => {
  it('Returns a list of series', async () => {

    const response = await request(app).get('/serie/serielist');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toBeInstanceOf(Array);

    const expectedSeriesId = 1;
    expect(response.body.results[0].series_id).toBe(expectedSeriesId);
  });
});


describe('GET /serie/serietable', () => {
  it('Returns a list of series and their genres', async () => {

    const response = await request(app).get('/serie/serietable');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toBeInstanceOf(Array);

    // Check if the first movie title is present
    expect(typeof response.body.results[0].genre_title).toBe('string');
  });
});

describe('POST /serie/create-serie', () => {
  it('Creates a new series successfully', async () => {
    const newSerie = {
      name: 'Breaking Good',
      description: 'A methamphetamine manufacturer turned high school chemistry teacher',
      genreId: 1
    };

    const response = await request(app)
      .post('/serie/create-serie')
      .send(newSerie)
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('series');
  });

  it('Returns 401 unauthorized for missing token', async () => {
    const response = await request(app)
      .post('/serie/create-serie')
      .send({
        name: 'Breaking Good',
        description: 'A methamphetamine manufacturer turned high school chemistry teacher'
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Unauthorized');
  });

  it('Returns 403 forbidden for invalid token', async () => {
    const response = await request(app)
      .post('/serie/create-serie')
      .send({
        name: 'Breaking Good',
        description: 'A methamphetamine manufacturer turned high school chemistry teacher'
      })
      .set('authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImR1bW15X3VzZXIiLCJwYXNzd29yZCI6InRlc3QxMjM0IiwiaWF0IjoxNjQ3NjQ0ODg2LCJleHAiOjE2NDc2NDg0ODZ9.VANXb8hjazOCvyC-C6YReHtrKqH5C06RY5VusWnJXfI`);


      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
  });

  it('Returns 400 when missing required fields', async () => {
    const response = await request(app)
      .post('/serie/create-serie')
      .send({
        name: 'Breaking Good',
        description: 'A methamphetamine manufacturer turned high school chemistry teacher'
      })
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Missing required fields in request body');
  });

  it('Returns 400 when data validation fails', async () => {
    const response = await request(app)
      .post('/serie/create-serie')
      .send({
        name: 'Breaking Good',
        description: 'A methamphetamine manufacturer turned high school chemistry teacher',
        genreId: 'Invalid genre'
      })
      .set('authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });
});

describe('POST /serie/update-serie', () => {
  it('Updates a series successfully', async () => {
    const updateData = {
      seriesId: 1,
      name: 'Updated Series Name',
      description: 'Updated series description',
      genreId: 2
    };

    const response = await request(app)
      .post('/serie/update-serie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('series');
    expect(response.body.series).toBe("Series successfully updated");
  });

  it('Returns 400 when seriesId is missing', async () => {
    const updateData = {
      name: 'Updated Series Name',
      description: 'Updated series description',
      genreId: 2
    };

    const response = await request(app)
      .post('/serie/update-serie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a number');
  });

  it('Returns 400 when data validation fails', async () => {
    const updateData = {
      seriesId: 1,
      name: 12345,
      description: 'Updated series description',
      genreId: 2
    };

    const response = await request(app)
      .post('/serie/update-serie')
      .set('authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid data, data should be a string');
  });

  it('Returns 401 unauthorized for missing token', async () => {
    const response = await request(app)
      .post('/serie/update-serie')
      .send({
        seriesId: 1,
        name: 'Updated Series Name',
        description: 'Updated series description',
        genreId: 2
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });

  it('Returns 403 forbidden for invalid token', async () => {
    const response = await request(app)
      .post('/serie/update-serie')
      .send({
        seriesId: 1,
        name: 'Updated Series Name',
        description: 'Updated series description',
        genreId: 2
      })
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
});





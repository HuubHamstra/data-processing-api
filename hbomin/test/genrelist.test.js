const request = require('supertest');
const app = require('../app'); 

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

    // Check if the title of the genres matches the expected values
    const expectedGenres = [
      { genre_id: 1, title: "Action", description: "Very cool" },
      { genre_id: 2, title: "Comedy", description: "Very funny" },
    ];

    expect(genreList).toEqual(expect.arrayContaining(expectedGenres));
  });

});

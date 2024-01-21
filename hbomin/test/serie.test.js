const request = require('supertest');
const app = require('../app'); 


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
      const expectedGenre = 'Comedy'
      expect(response.body.results[0].genre_title).toBe(expectedGenre);
    });
});

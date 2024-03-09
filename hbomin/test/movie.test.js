const request = require('supertest');
const app = require('../app'); 


describe('GET /movie/movietable', () => {
    it('Returns a list of movies successfully. First results genre_title equal to "Action"', async () => {
        
      const response = await request(app).get('/movie/movietable');
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toBeInstanceOf(Array);
  
      const expectedGenreTitle = 'Action';
      expect(response.body.results[0].genre_title).toBe(expectedGenreTitle);
    });
  });


describe('GET /movie/movielist', () => {
    it('Returns a movielist where the duration is also present', async () => {
      
      const response = await request(app).get('/movie/movielist');
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toBeInstanceOf(Array);
  
      // Check if the first movie title is present
      const firstMovieTitle = 'James Bond'; 
      const firstMovieDuration = 500
      expect(response.body.results[0].title).toBe(firstMovieTitle);
      expect(response.body.results[0].duration).toBe(firstMovieDuration);
    });
});

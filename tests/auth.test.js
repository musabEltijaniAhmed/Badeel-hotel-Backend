const request = require('supertest');
const app = require('../app');

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
}); 
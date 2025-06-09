const request = require('supertest');
const app     = require('../app');

describe('GET /api/v1/health', () => {
  it('returns 200 with { status: "OK", timestamp }', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(() => new Date(res.body.timestamp)).not.toThrow();
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
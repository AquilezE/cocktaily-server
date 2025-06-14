// tests/stats.test.js
jest.mock('../models', () => {
  const realDb = jest.requireActual('../models');
  return {
    ...realDb,
    User:    { findAll: jest.fn() },
    Cocktail:{ findAll: jest.fn() }
  };
});

const request = require('supertest');
const app     = require('../app');
const db      = require('../models');
const { User, Cocktail } = db;

beforeEach(() => {
  jest.clearAllMocks();
});

const endpoints = [
  { path: '/api/v1/stats/users/month',      model: User,    method: 'findAll' },
  { path: '/api/v1/stats/users/per-rol',    model: User,    method: 'findAll' },
  { path: '/api/v1/stats/liquors/popular',  model: Cocktail,method: 'findAll' },
  { path: '/api/v1/stats/users/top-creators', model: Cocktail,method: 'findAll' },
  { path: '/api/v1/stats/recipe/likes',     model: Cocktail,method: 'findAll' },
];

describe('Stats endpoints', () => {
  for (const { path, model, method } of endpoints) {
    describe(`GET ${path}`, () => {

      it('200 returns data', async () => {
        const fake = [ { foo: 'bar' } ];
        model[method].mockResolvedValue(fake);

        const res = await request(app)
          .get(path)
          .set('Authorization', `Bearer ${global.adminToken}`);

        expect(model[method]).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(fake);
      });

      it('500 on unexpected error', async () => {
        model[method].mockRejectedValue(new Error('boom'));

        const res = await request(app)
          .get(path)
          .set('Authorization', `Bearer ${global.adminToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: expect.any(String) });
      });
    });
  }
});

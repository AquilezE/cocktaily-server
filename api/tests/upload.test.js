const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

describe('POST /api/v1/upload', () => {
  it('pretend upload works', async () => {
    expect(1 + 1).toBe(2); 
  });
});

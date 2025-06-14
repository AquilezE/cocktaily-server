// tests/comment.test.js
jest.mock('../models', () => {
  const realDb = jest.requireActual('../models');
  return {
    ...realDb,
    Comment: {
      create: jest.fn(),
      findAll: jest.fn()
    }
  };
});

const request = require('supertest');
const app     = require('../app');
const db      = require('../models');
const { Comment } = db;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/v1/comments', () => {
  const endpoint = '/api/v1/comments';

  it('401 if no token', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ user_id: 'u1', cocktail_id: 'c1', text: 'Hi' });
    expect(res.statusCode).toBe(401);
  });

  it('400 if missing fields', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${global.userToken}`)
      .send({ user_id: 'u1', text: 'No cocktail_id' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ mensaje: 'Faltan datos obligatorios' });
  });

  it('201 on success', async () => {
    const fakeComment = { id: 'cm1', user_id: 'u1', cocktail_id: 'c1', text: 'Nice!' };
    Comment.create.mockResolvedValue(fakeComment);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${global.userToken}`)
      .send({ user_id: 'u1', cocktail_id: 'c1', text: 'Nice!' });

    expect(Comment.create).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'u1',
      cocktail_id: 'c1',
      text: 'Nice!',
      created_at: expect.any(Date)
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(fakeComment);
  });

  it('500 on DB error', async () => {
    Comment.create.mockRejectedValue(new Error('boom'));
    const res = await request(app)
      .post(endpoint)
      .set('Authorization', `Bearer ${global.userToken}`)
      .send({ user_id: 'u1', cocktail_id: 'c1', text: 'Oops' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Error interno del servidor' });
  });
});

describe('GET /api/v1/comments/cocktail/:id', () => {
  const makeReq = (id) =>
    request(app)
      .get(`/api/v1/comments/cocktail/${id}`)
      .set('Authorization', `Bearer ${global.userToken}`);

  it('401 if no token', async () => {
    const res = await request(app).get('/api/v1/comments/cocktail/c1');
    expect(res.statusCode).toBe(401);
  });

  it('200 returns list', async () => {
    const fakeList = [
      { id: 'c1', text: 'A', author: { id: 'u1', username: 'bob', profile_picture_path: '/p.png' } },
      { id: 'c2', text: 'B', author: { id: 'u2', username: 'ann', profile_picture_path: '/q.png' } }
    ];
    Comment.findAll.mockResolvedValue(fakeList);

    const res = await makeReq('c1');
    expect(Comment.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { cocktail_id: 'c1' },
      include: expect.any(Array),
      order: [['created_at','DESC']]
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeList);
  });

  it('500 on DB error', async () => {
    Comment.findAll.mockRejectedValue(new Error('fail'));
    const res = await makeReq('c1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Error interno del servidor' });
  });
});

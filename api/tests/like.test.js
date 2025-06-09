
jest.mock('../middleware/auth.middleware', () => ({
  Authorize: () => (req, res, next) => {
    req.user = { id: 'u1', username: 'joe' };
    next();
  }
}));

jest.mock('../models', () => {
  const real = jest.requireActual('../models');
  return {
    ...real,
    Like: {
      findOne: jest.fn(),
      create:  jest.fn(),
      destroy: jest.fn()
    },
    Cocktail: {
      findByPk: jest.fn()
    },
    User: {
      findByPk: jest.fn()
    },
    DeviceRegistration: {
      findAll: jest.fn()
    }
  };
});

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => ({
    sendEachForMulticast: jest.fn().mockResolvedValue({
      successCount: 1,
      failureCount: 0,
      responses: []
    })
  })
}));

const request = require('supertest');
const app     = require('../app');
const { Like, Cocktail, User, DeviceRegistration } = require('../models');

beforeEach(() => jest.clearAllMocks());

describe('POST /api/v1/likes/:cocktailId', () => {
  it('409 if user already liked', async () => {
    Like.findOne.mockResolvedValue({});  
    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ message: 'Ya diste like' });
  });

  it('404 if cocktail not found', async () => {
    Like.findOne.mockResolvedValue(null);
    Cocktail.findByPk.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Cóctel no encontrado' });
  });

  it('201 if like created but author missing', async () => {
    Like.findOne.mockResolvedValue(null);
    Cocktail.findByPk.mockResolvedValue({ id: '123', name: 'X', user_id: 'u2' });
    Like.create.mockResolvedValue({});
    User.findByPk.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Like registrado, pero no se pudo notificar al autor' });
  });

  it('201 if like created and author found with no tokens', async () => {
    Like.findOne.mockResolvedValue(null);
    Cocktail.findByPk.mockResolvedValue({ id: '123', name: 'X', user_id: 'u2' });
    Like.create.mockResolvedValue({});
    User.findByPk.mockResolvedValue({ id: 'u2', username: 'bob' });
    DeviceRegistration.findAll.mockResolvedValue([]); 

    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Like registrado correctamente' });
  });

  it('201 if like created and author found with tokens', async () => {
    Like.findOne.mockResolvedValue(null);
    Cocktail.findByPk.mockResolvedValue({ id: '123', name: 'X', user_id: 'u2' });
    Like.create.mockResolvedValue({});
    User.findByPk.mockResolvedValue({ id: 'u2', username: 'bob' });
    DeviceRegistration.findAll.mockResolvedValue([
      { registration_token: 't1' },
      { registration_token: '' },    
      { registration_token: 't2' }
    ]);

    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Like registrado correctamente' });
  });

  it('500 on unexpected error', async () => {
    Like.findOne.mockRejectedValue(new Error());
    const res = await request(app).post('/api/v1/likes/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Error interno del servidor' });
  });
});


describe('DELETE /api/v1/likes/:cocktailId', () => {
  it('404 if like not found', async () => {
    Like.destroy.mockResolvedValue(0);
    const res = await request(app).delete('/api/v1/likes/123');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Like no encontrado' });
  });

  it('200 on successful removal', async () => {
    Like.destroy.mockResolvedValue(1);
    const res = await request(app).delete('/api/v1/likes/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Like eliminado correctamente' });
  });

  it('500 on unexpected error', async () => {
    Like.destroy.mockRejectedValue(new Error());
    const res = await request(app).delete('/api/v1/likes/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Error interno del servidor' });
  });
});

describe('GET /api/v1/likes/:cocktailId/hasLiked', () => {
  it('400 if userId query missing', async () => {
    const res = await request(app).get('/api/v1/likes/123/hasLiked');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Parámetro userId requerido' });
  });

  it('200 hasLiked=true when a record exists', async () => {
    Like.findOne.mockResolvedValue({});  
    const res = await request(app).get('/api/v1/likes/123/hasLiked').query({ userId: '1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ hasLiked: true });
  });

  it('200 hasLiked=false when none exists', async () => {
    Like.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/likes/123/hasLiked').query({ userId: '1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ hasLiked: false });
  });

  it('500 on unexpected error', async () => {
    Like.findOne.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/likes/123/hasLiked').query({ userId: '1' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Error interno del servidor' });
  });
});

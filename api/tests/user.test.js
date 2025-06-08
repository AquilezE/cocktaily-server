jest.mock('../models', () => {
  const realDb = jest.requireActual('../models');
  return {
    ...realDb,
    User: {
      findAll:    jest.fn(),
      findByPk:   jest.fn(),
      findOne:    jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      destroy:    jest.fn()
    }
  };
});
jest.mock('bcrypt');

const request = require('supertest');
const app     = require('../app');
const db      = require('../models');
const bcrypt  = require('bcrypt');
const { User } = db;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/usuario/username/:username', () => {
  it('200 if user found', async () => {
    const fake = { id: 'u1', username: 'joe' };
    User.findOne.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/usuario/username/joe');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fake);
  });

  it('404 if not found', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/usuario/username/nobody');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.findOne.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/usuario/username/x');
    expect(res.statusCode).toBe(500);
  });
});

describe('POST /api/v1/usuario', () => {
  const valid = {
    username: 'joe',
    email: 'joe@x.com',
    password: 'secret',
    profile_picture_path: '/pic.png',
    bio: 'hi',
    role: 'user'
  };

  it('400 if password missing', async () => {
    const { password, ...noPass } = valid;
    const res = await request(app).post('/api/v1/usuario').send(noPass);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Password es requerido' });
  });

  it('201 on success', async () => {
    const created = {
      toJSON: () => ({ id: 'u1', ...valid, password_hash: 'hash' })
    };
    bcrypt.hash.mockResolvedValue('hash');
    User.create.mockResolvedValue(created);

    const res = await request(app).post('/api/v1/usuario').send(valid);
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      username: 'joe',
      password_hash: 'hash'
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 'u1', username: 'joe', email: 'joe@x.com', profile_picture_path: '/pic.png', bio: 'hi', role: 'user', password: 'secret' });
  });

  it('500 on error', async () => {
    bcrypt.hash.mockRejectedValue(new Error());
    const res = await request(app).post('/api/v1/usuario').send(valid);
    expect(res.statusCode).toBe(500);
  });
});

describe('GET /api/v1/usuario/:id', () => {
  it('200 if found', async () => {
    const fake = { id: 'u1', username: 'joe' };
    User.findByPk.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/usuario/u1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fake);
  });

  it('404 if not found', async () => {
    User.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/usuario/u2');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.findByPk.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/usuario/x');
    expect(res.statusCode).toBe(500);
  });
});

describe('PUT /api/v1/usuario/:id', () => {
  it('200 on success', async () => {
    User.update.mockResolvedValue([1]);
    User.findByPk.mockResolvedValue({ id: 'u1', username: 'joe' });

    const res = await request(app)
      .put('/api/v1/usuario/u1')
      .send({ bio: 'updated' });

    expect(User.update).toHaveBeenCalledWith({ bio: 'updated' }, { where: { id: 'u1' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 'u1', username: 'joe' });
  });

  it('404 if nothing updated', async () => {
    User.update.mockResolvedValue([0]);
    const res = await request(app)
      .put('/api/v1/usuario/u1')
      .send({ bio: 'x' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.update.mockRejectedValue(new Error());
    const res = await request(app)
      .put('/api/v1/usuario/u1')
      .send({ bio: 'x' });
    expect(res.statusCode).toBe(500);
  });
});

describe('POST /api/v1/usuario/:id/change-password', () => {
  const pwBody = { currentPassword: 'old', newPassword: 'new' };

  it('400 if missing fields', async () => {
    const res = await request(app).post('/api/v1/usuario/u1/change-password').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Contraseña actual y nueva son requeridas' });
  });

  it('404 if user not found', async () => {
    User.findByPk.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/usuario/u1/change-password').send(pwBody);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Usuario no encontrado' });
  });

  it('401 if current password wrong', async () => {
    const fake = { password_hash: 'hash' };
    User.findByPk.mockResolvedValue(fake);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/api/v1/usuario/u1/change-password').send(pwBody);
    expect(bcrypt.compare).toHaveBeenCalledWith('old', 'hash');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Contraseña actual incorrecta' });
  });

  it('200 on success', async () => {
    const fake = { password_hash: 'hash', save: jest.fn() };
    User.findByPk.mockResolvedValue(fake);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newHash');

    const res = await request(app).post('/api/v1/usuario/u1/change-password').send(pwBody);
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(fake.password_hash).toBe('newHash');
    expect(fake.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Contraseña actualizada correctamente' });
  });

  it('500 on error', async () => {
    User.findByPk.mockRejectedValue(new Error());
    const res = await request(app).post('/api/v1/usuario/u1/change-password').send(pwBody);
    expect(res.statusCode).toBe(500);
  });
});

describe('DELETE /api/v1/usuario/:id', () => {
  it('204 on success', async () => {
    User.destroy.mockResolvedValue(1);
    const res = await request(app).delete('/api/v1/usuario/u1');
    expect(res.statusCode).toBe(204);
  });

  it('404 if not found', async () => {
    User.destroy.mockResolvedValue(0);
    const res = await request(app).delete('/api/v1/usuario/u1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.destroy.mockRejectedValue(new Error());
    const res = await request(app).delete('/api/v1/usuario/u1');
    expect(res.statusCode).toBe(500);
  });
});

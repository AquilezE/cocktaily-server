// tests/user.test.js
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
const bcrypt  = require('bcrypt');
const { User } = require('../models');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/usuarios/username/:username', () => {
  it('200 if user found', async () => {
    const fake = { id: 'u1', username: 'joe' };
    User.findOne.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/usuarios/username/joe');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fake);
  });

  it('404 if not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/usuarios/username/nobody');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.findOne.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/v1/usuarios/username/x');
    expect(res.statusCode).toBe(500);
  });
});

describe('GET /api/v1/usuarios/:id', () => {
  it('200 if found', async () => {
    const fake = { id: 'u1', username: 'joe' };
    User.findByPk.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/usuarios/u1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fake);
  });

  it('404 if not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/usuarios/u2');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on error', async () => {
    User.findByPk.mockRejectedValue(new Error('db'));

    const res = await request(app).get('/api/v1/usuarios/x');
    expect(res.statusCode).toBe(500);
  });
});

describe('POST /api/v1/usuarios', () => {
  const valid = {
    username:             'joe',
    email:                'joe@x.com',
    password:             'secret',
    profile_picture_path: '/pic.png',
    bio:                  'hi',
    role:                 'user'
  };

  it('400 if password missing', async () => {
    const { password, ...noPass } = valid;
    const res = await request(app).post('/api/v1/usuarios').send(noPass);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Password es requerido' });
  });

  it('409 if email already in use', async () => {
    User.findOne.mockResolvedValue({ id: 'uX' }); // email conflict

    const res = await request(app).post('/api/v1/usuarios').send(valid);
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: valid.email } });
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'El correo ya está en uso' });
  });

  it('409 if username already in use', async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'uY' });

    const res = await request(app).post('/api/v1/usuarios').send(valid);
    expect(User.findOne).toHaveBeenNthCalledWith(2, { where: { username: valid.username } });
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'El nombre de usuario ya está en uso' });
  });

  it('201 on success', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hash123');

    const newUser = {
      toJSON: () => ({
        id:                   'u1',
        username:             valid.username,
        email:                valid.email,
        password_hash:        'hash123',
        profile_picture_path: valid.profile_picture_path,
        bio:                  valid.bio,
        role:                 valid.role
      })
    };
    User.create.mockResolvedValue(newUser);

    const res = await request(app).post('/api/v1/usuarios').send(valid);

    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      username: valid.username,
      email:    valid.email,
      password_hash: 'hash123'
    }));
    expect(res.statusCode).toBe(201);

    expect(res.body).toEqual({
      id:                   'u1',
      username:             'joe',
      email:                'joe@x.com',
      profile_picture_path: '/pic.png',
      bio:                  'hi',
      role:                 'user'
    });
  });

  it('500 on unexpected error', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/v1/usuarios').send(valid);
    expect(res.statusCode).toBe(500);
  });
});

describe('PUT /api/v1/usuarios/:id', () => {
  it('404 if user not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/v1/usuarios/u1')
      .send({ bio: 'x' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Usuario no encontrado' });
  });

  it('409 on email conflict', async () => {
    const fake = { id: 1, email: 'old@x.com', username: 'old' };
    User.findByPk.mockResolvedValue(fake);
    User.findOne.mockResolvedValue({ id: 2 }); // conflict on email

    const res = await request(app)
      .put('/api/v1/usuarios/1')
      .send({ email: 'joe2@x.com' });

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'joe2@x.com' } });
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'El correo ya está en uso por otro usuario' });
  });

  it('409 on username conflict', async () => {
    const fake = { id: 1, email: 'a@b.com', username: 'old' };
    User.findByPk.mockResolvedValue(fake);
    User.findOne.mockResolvedValueOnce({ id: 2 });

    const res = await request(app)
      .put('/api/v1/usuarios/1')
      .send({ username: 'joe2' });

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'joe2' } });
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'El nombre de usuario ya está en uso por otro usuario' });
  });

  it('200 on success', async () => {
    const fake = {
      id:       'u1',
      username: 'old',
      email:    'old@x.com',
      update: jest.fn(function (changes) {
        Object.assign(this, changes);
        return Promise.resolve(this);
      })
    };
    User.findByPk.mockResolvedValue(fake);

    const res = await request(app)
      .put('/api/v1/usuarios/u1')
      .send({ bio: 'newbio' });

    expect(fake.update).toHaveBeenCalledWith({ bio: 'newbio' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id:       'u1',
      username: 'old',
      email:    'old@x.com',
      bio:      'newbio'
    });
  });

  it('500 on unexpected error', async () => {
    User.findByPk.mockRejectedValue(new Error('boom'));
    const res = await request(app)
      .put('/api/v1/usuarios/u1')
      .send({ bio: 'x' });
    expect(res.statusCode).toBe(500);
  });
});

describe('POST /api/v1/usuarios/:id/change-password', () => {
  const pwBody = { currentPassword: 'old', newPassword: 'new' };

  it('400 if missing fields', async () => {
    const res = await request(app)
      .patch('/api/v1/usuarios/1/change-password')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Contraseña actual y nueva son requeridas' });
  });

  it('404 if user not found', async () => {
    User.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/v1/usuarios/u1/change-password')
      .send(pwBody);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Usuario no encontrado' });
  });

  it('401 if current password wrong', async () => {
    const fake = { password_hash: 'hash' };
    User.findByPk.mockResolvedValue(fake);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .patch('/api/v1/usuarios/u1/change-password')
      .send(pwBody);
    expect(bcrypt.compare).toHaveBeenCalledWith('old', 'hash');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Contraseña actual incorrecta' });
  });

  it('200 on success', async () => {
    const fake = { password_hash: 'hash', save: jest.fn() };
    User.findByPk.mockResolvedValue(fake);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newHash');

    const res = await request(app)
      .patch('/api/v1/usuarios/u1/change-password')
      .send(pwBody);
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(fake.password_hash).toBe('newHash');
    expect(fake.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Contraseña actualizada correctamente' });
  });

  it('500 on unexpected error', async () => {
    User.findByPk.mockRejectedValue(new Error('boom'));
    const res = await request(app)
      .patch('/api/v1/usuarios/1/change-password')
      .send(pwBody);
    expect(res.statusCode).toBe(500);
  });
});

describe('DELETE /api/v1/usuarios/:id', () => {
  it('204 on success', async () => {
    User.destroy.mockResolvedValue(1);
    const res = await request(app).delete('/api/v1/usuarios/u1');
    expect(res.statusCode).toBe(204);
  });

  it('404 if not found', async () => {
    User.destroy.mockResolvedValue(0);
    const res = await request(app).delete('/api/v1/usuarios/u1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('500 on unexpected error', async () => {
    User.destroy.mockRejectedValue(new Error('boom'));
    const res = await request(app).delete('/api/v1/usuarios/u1');
    expect(res.statusCode).toBe(500);
  });
});

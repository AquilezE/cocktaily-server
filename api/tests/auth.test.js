const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const {GenerarToken} = require('../services/jwtoken.service');

const jwt = require('jsonwebtoken');


jest.mock('bcrypt');
jest.mock('../services/jwtoken.service');



describe('GET /api/v1/auth/time', () => {
    it('returns 401 if no token is provided', async () => {
        const response = await request(app).get('/api/v1/auth/time');
        expect(response.statusCode).toBe(401);
    });

    it('returns 403 if user does not have admin role', async () => {
        const response = await request(app)
            .get('/api/v1/auth/time')
            .set('authorization', `Bearer ${global.userToken}`);
        expect(response.statusCode).toBe(403);
    });

});

describe('POST /api/v1/auth/login', () => {

  it('returns 401 if email not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noexiste@dominio.com', password: 'whatever' });

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'noexiste@dominio.com' }, raw: true });
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ message: 'Usuario o contraseña incorrectas' });
  });

  it('returns 401 if password is incorrect', async () => {
    const fakeUser = {
      id: 42,
      email: 'test@dominio.com',
      username: 'testuser',
      role: 'usuario',
      password_hash: '$2b$10$abcdefghijklmnopqrstuv' 
    };
    User.findOne = jest.fn().mockResolvedValue(fakeUser);

    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@dominio.com', password: 'wrongPassword' });

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@dominio.com' }, raw: true });
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', fakeUser.password_hash);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ message: 'Usuario o contraseña incorrectas' });
  });

  it('returns 200 and a token if credentials are valid', async () => {
    const validUser = {
      id: 99,
      email: 'valid@dominio.com',
      username: 'validuser',
      role: 'admin',
      password_hash: '$2b$10$validhashhere'
    };
    User.findOne = jest.fn().mockResolvedValue(validUser);

    bcrypt.compare.mockResolvedValue(true);

    GenerarToken.mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'valid@dominio.com', password: 'correctPassword' });

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'valid@dominio.com' }, raw: true });
    expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', validUser.password_hash);
    expect(GenerarToken).toHaveBeenCalledWith(validUser.id, validUser.email, validUser.username, validUser.role);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      email: validUser.email,
      username: validUser.username,
      role: validUser.role,
      jwt: 'fake-jwt-token'
    });
  });

  it('returns 400 if an unexpected error is thrown', async () => {
    // Force User.findOne to throw
    User.findOne = jest.fn().mockImplementation(() => {
      throw new Error('DB is down');
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'oops@dominio.com', password: 'doesnt_matter' });

    expect(User.findOne).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      message: 'Error al iniciar sesión',
      error: expect.stringContaining('DB is down')
    });
  });
});


jest.mock('../models', () => {
  const realDb = jest.requireActual('../models');
  return {
    ...realDb,
    LiveSession: {
      create:  jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn()
    }
  };
});
jest.mock('random-words');             
const randomWords = require('random-words');
const request      = require('supertest');
const { LiveSession } = require('../models');
const app          = require('../app');


beforeEach(() => {
  randomWords.generate.mockReturnValue(['abcde']);
});


describe('LiveSession Routes', () => {
  let mathRandomSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TRANSMISION_IP = 'localhost';
    mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    randomWords.generate.mockReturnValue(['abcde']);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  describe('POST /api/v1/livesession', () => {
    it('400 when missing fields', async () => {
      const res = await request(app).post('/api/v1/livesession').send({ user_id: 'u1' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ mensaje: 'Faltan campos obligatorios.' });
    });

    it('201 on successful creation', async () => {
      const now = new Date();
      const sessionObj = {
        id:         's1',
        user_id:    'u1',
        title:      'T1',
        stream_key: 'abcde1000',
        url:        'http://localhost/live/abcde1000.m3u8',
        started_at: now.toISOString(),
        ended_at:   null
      };
      LiveSession.create.mockResolvedValue(sessionObj);

      const res = await request(app)
        .post('/api/v1/livesession')
        .send({ user_id: 'u1', title: 'T1' });

      expect(randomWords.generate).toHaveBeenCalledWith({ exactly: 1, minLength: 5, maxLength: 10 });
      expect(LiveSession.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'u1',
        title: 'T1',
        stream_key: 'abcde1000',
        url: 'http://localhost/live/abcde1000.m3u8',
        started_at: expect.any(Date),
        ended_at: null
      }));
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(sessionObj);
    });

    it('500 on unexpected error', async () => {
      LiveSession.create.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/v1/livesession')
        .send({ user_id: 'u1', title: 'T1' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ mensaje: 'Error del servidor.' });
    });
  });

  describe('GET /api/v1/livesession', () => {
    it('200 returns all sessions', async () => {
      const fakeSessions = [
        { get: () => ({ id: 's1', title: 't1', host: { id: 'u1', username: 'joe' } }) },
        { get: () => ({ id: 's2', title: 't2', host: { id: 'u2', username: 'anna' } }) }
      ];
      LiveSession.findAll.mockResolvedValue(fakeSessions);

      const res = await request(app).get('/api/v1/livesession');
      expect(LiveSession.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        sessions: [
          { id: 's1', title: 't1', host: { id: 'u1', username: 'joe' } },
          { id: 's2', title: 't2', host: { id: 'u2', username: 'anna' } }
        ]
      });
    });

    it('200 filters only active sessions', async () => {
      LiveSession.findAll.mockResolvedValue([]);
      const res = await request(app).get('/api/v1/livesession').query({ active: 'true' });

      expect(LiveSession.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { ended_at: null } })
      );
      expect(res.statusCode).toBe(200);
    });

    it('500 on unexpected error', async () => {
      LiveSession.findAll.mockRejectedValue(new Error());
      const res = await request(app).get('/api/v1/livesession');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ mensaje: 'Error del servidor.' });
    });
  });

  describe('PUT /api/v1/livesession/:id', () => {
    it('400 when missing fields', async () => {
      const res = await request(app).put('/api/v1/livesession/s1').send({ title: 'T1' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ mensaje: 'Faltan campos obligatorios.' });
    });

    it('404 if session not found', async () => {
      LiveSession.findByPk.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/v1/livesession/s1')
        .send({ title: 'T1', ended_at: '2025-06-08T00:00:00Z' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ mensaje: 'LiveSession no encontrada.' });
    });

    it('200 on successful update', async () => {
      const fake = { save: jest.fn(), title: 'old', ended_at: null };
      LiveSession.findByPk.mockResolvedValue(fake);

      const dateStr = '2025-06-08T00:00:00Z';
      const res = await request(app)
        .put('/api/v1/livesession/s1')
        .send({ title: 'New Title', ended_at: dateStr });

      expect(fake.title).toBe('New Title');
      expect(fake.ended_at).toBe(dateStr);
      expect(fake.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);

    });

    it('500 on unexpected error', async () => {
      LiveSession.findByPk.mockRejectedValue(new Error());
      const res = await request(app)
        .put('/api/v1/livesession/s1')
        .send({ title: 'New', ended_at: '2025-06-08T00:00:00Z' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ mensaje: 'Error del servidor.' });
    });
  });
});

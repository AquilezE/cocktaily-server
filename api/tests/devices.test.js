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
    DeviceRegistration: {
      upsert:   jest.fn(),
      destroy:  jest.fn()
    }
  };
});

const request = require('supertest');
const app     = require('../app');
const { DeviceRegistration } = require('../models');
const controller = require('../controllers/devices');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/v1/devices', () => {
  it('200 on successful upsert', async () => {
    const fakeDevice = { user_id: 'u1', device_id: 'd1', registration_token: 't1', platform: 'ios' };
    DeviceRegistration.upsert.mockResolvedValue([fakeDevice, true]);

    const res = await request(app)
      .post('/api/v1/devices')
      .send({
        deviceId: 'd1',
        registrationToken: 't1',
        platform: 'ios'
      });

    expect(DeviceRegistration.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        device_id: 'd1',
        registration_token: 't1',
        platform: 'ios',
        last_updated: expect.any(Date)
      }),
      { returning: true }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, device: fakeDevice });
  });

  it('500 on upsert failure', async () => {
    DeviceRegistration.upsert.mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .post('/api/v1/devices')
      .send({
        deviceId: 'd1',
        registrationToken: 't1',
        platform: 'ios'
      });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Error al registrar el dispositivo',
      error: 'fail'
    });
  });
});

describe('DELETE /api/v1/devices/:deviceId', () => {
  it('500 on destroy failure', async () => {
    DeviceRegistration.destroy.mockRejectedValue(new Error('boom'));
    const res = await request(app).delete('/api/v1/devices/d1');
    expect(DeviceRegistration.destroy).toHaveBeenCalledWith({
      where: { user_id: 'u1', device_id: 'd1' }
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Error al eliminar el dispositivo',
      error: 'boom'
    });
  });
});

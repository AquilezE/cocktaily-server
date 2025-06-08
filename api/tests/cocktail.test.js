
jest.mock('../models', () => {
  const realDb = jest.requireActual('../models');

  return {
    ...realDb,

    Cocktail: {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn()
    },
    Ingredient: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    CocktailIngredient: {
      create: jest.fn()
    },
    Sequelize: realDb.Sequelize
  };
});

const request = require('supertest');
const app     = require('../app');               


const db = require('../models');    
const { Cocktail, Ingredient, CocktailIngredient } = db;
describe('POST /api/v1/cocktails', () => {
  const validBody = {
    name: 'Mojito',
    creation_steps: 'Muddle mint...',
    video_url: 'http://vid',
    image_url: 'http://img',
    user_id: 'u1',
    preparation_time: 5,
    is_non_alcoholic: false,
    alcohol_type: 'rum',
    ingredients: [{ name: 'Mint', quantity: '5 leaves' }]
  };

  it('400 if missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/cocktails')
      .send({ ...validBody, name: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ mensaje: 'Por favor llene todos los campos' });
  });

  it('201 on success and creates ingredients', async () => {
    Cocktail.create.mockResolvedValue({ id: 42 });
    Ingredient.findOne.mockResolvedValue(null);
    Ingredient.create.mockResolvedValue({ id: 7 });
    CocktailIngredient.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/cocktails')
      .send(validBody);

    expect(Cocktail.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Mojito',
      status: 'pendiente de revision'
    }));
    expect(Ingredient.findOne).toHaveBeenCalledWith({ where: { name: 'Mint' } });
    expect(Ingredient.create).toHaveBeenCalledWith({ name: 'Mint' });
    expect(CocktailIngredient.create).toHaveBeenCalledWith({
      cocktail_id: 42,
      ingredient_id: 7,
      quantity: '5 leaves'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toMatch(/enviada a revisión/);
  });

  it('500 if create throws', async () => {
    Cocktail.create.mockRejectedValue(new Error('db error'));
    const res = await request(app)
      .post('/api/v1/cocktails')
      .send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      mensaje: 'No pudimos establecer conexión con el servidor. Por favor intente más tarde.'
    });
  });
});

describe('GET /api/v1/cocktails', () => {
  it('200 returns accepted cocktails formatted', async () => {
    const fake = [{
      id: 1, name: 'A', creation_steps: '…', preparation_time: 3,
      is_non_alcoholic: true, alcohol_type: null,
      video_url: 'v', image_url: 'i',
      createdAt: new Date(), updatedAt: new Date(),
      user_id: 'u1',
      ingredients: [{ id: 9, name: 'X', CocktailIngredient: { quantity: '1' } }],
      likes: [{}, {}]
    }];
    Cocktail.findAll.mockResolvedValue(fake);

    const res = await request(app)
      .get('/api/v1/cocktails')
      .query({ isNonAlcoholic: 'true' });

    expect(Cocktail.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: 'aceptada', is_non_alcoholic: true })
    }));

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toMatchObject({ id: 1, likes: 2 });
  });

  it('500 on error', async () => {
    Cocktail.findAll.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/cocktails');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Errorasdas del servidor' });
  });
});

describe('GET /api/v1/cocktails/:id', () => {
  it('200 if found', async () => {
    const fake = {
      id: 'r1', status: 'aceptada', created_at: 'c', updated_at: 'u',
      name: 'X', creation_steps: '…', preparation_time: 4,
      is_non_alcoholic: false, alcohol_type: 'gin',
      video_url: 'v', image_url: 'i',
      author: { id: 'u1', username: 'bob' },
      ingredients: [], comments: [], likes: []
    };
    Cocktail.findOne.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ id: 'r1', author: { username: 'bob' } });
  });

  it('404 if not found', async () => {
    Cocktail.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/cocktails/nope');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ mensaje: 'Receta no encontrada o aún no ha sido aceptada' });
  });
});

describe('PUT /api/v1/cocktails/accept/:id', () => {
  it('404 if not exist', async () => {
    Cocktail.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/v1/cocktails/accept/r1')
    expect(res.statusCode).toBe(404);
  });

  it('409 on timestamp mismatch', async () => {
    const dt = new Date('2025-01-01');
    Cocktail.findByPk.mockResolvedValue({
      updatedAt: dt,
      save: jest.fn()
    });
    const res = await request(app)
      .patch('/api/v1/cocktails/accept/r1')
      .send({ lastUpdated: '2025-01-02' });

    expect(res.statusCode).toBe(409);
  });

  it('200 on success', async () => {
    const now = new Date();
    const fake = { updatedAt: now, save: jest.fn() };
    Cocktail.findByPk.mockResolvedValue(fake);

    const res = await request(app)
      .patch('/api/v1/cocktails/accept/r1')
      .send({ lastUpdated: now.toISOString() });

    expect(res.statusCode).toBe(200);
    expect(fake.save).toHaveBeenCalled();
  });
});

describe('POST /api/v1/cocktails', () => {
  const valid = {
    name: 'Mojito',
    creation_steps: 'Step1',
    video_url: 'http://v',
    image_url: 'http://i',
    user_id: 'u1',
    preparation_time: 5,
    is_non_alcoholic: false,
    alcohol_type: 'rum',
    ingredients: [{ name: 'Mint', quantity: '5 leaves' }]
  };

  it('400 if required fields missing', async () => {
    const res = await request(app)
      .post('/api/v1/cocktails')
      .send({ ...valid, name: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ mensaje: 'Por favor llene todos los campos' });
  });

  it('201 on success and creates linked ingredients', async () => {
    Cocktail.create.mockResolvedValue({ id: 42 });
    db.Ingredient.findOne.mockResolvedValue(null);
    db.Ingredient.create.mockResolvedValue({ id: 7 });
    db.CocktailIngredient.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/cocktails')
      .send(valid);

    expect(Cocktail.create).toHaveBeenCalledWith(expect.objectContaining({
      name: valid.name,
      status: 'pendiente de revision'
    }));
    expect(db.Ingredient.findOne).toHaveBeenCalledWith({ where: { name: 'Mint' } });
    expect(db.Ingredient.create).toHaveBeenCalledWith({ name: 'Mint' });
    expect(db.CocktailIngredient.create).toHaveBeenCalledWith({
      cocktail_id: 42,
      ingredient_id: 7,
      quantity: '5 leaves'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toMatch(/enviada a revisión/);
  });

  it('500 if creation throws', async () => {
    Cocktail.create.mockRejectedValue(new Error('db error'));
    const res = await request(app)
      .post('/api/v1/cocktails')
      .send(valid);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      mensaje: 'No pudimos establecer conexión con el servidor. Por favor intente más tarde.'
    });
  });
});


describe('GET /api/v1/cocktails', () => {
  it('200 returns formatted list with filters', async () => {
    const fake = [{
      id: 1,
      name: 'A',
      creation_steps: '…',
      preparation_time: 3,
      is_non_alcoholic: true,
      alcohol_type: null,
      video_url: 'v',
      image_url: 'i',
      createdAt: new Date(),
      updatedAt: new Date(),
      user_id: 'u1',
      ingredients: [{ id: 9, name: 'X', CocktailIngredient: { quantity: '1' } }],
      likes: [{}, {}]
    }];
    Cocktail.findAll.mockResolvedValue(fake);

    const res = await request(app)
      .get('/api/v1/cocktails')
      .query({ isNonAlcoholic: 'true', name: 'A', maxPreparationTime: '10' });

    expect(Cocktail.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: 'aceptada', is_non_alcoholic: true })
    }));
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toMatchObject({ id: 1, likes: 2 });
  });

  it('500 on error', async () => {
    Cocktail.findAll.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/cocktails');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Errorasdas del servidor' });
  });
});


describe('GET /api/v1/cocktails/:id', () => {
  it('200 if recipe found', async () => {
    const fake = {
      id: 'r1',
      status: 'aceptada',
      name: 'X',
      creation_steps: '…',
      preparation_time: 4,
      is_non_alcoholic: false,
      alcohol_type: 'gin',
      video_url: 'v',
      image_url: 'i',
      created_at: 'c',
      updated_at: 'u',
      author: { id: 'u1', username: 'bob' },
      ingredients: [],
      comments: [],
      likes: []
    };
    Cocktail.findOne.mockResolvedValue(fake);

    const res = await request(app).get('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ id: 'r1', author: { username: 'bob' } });
  });

  it('404 if not found', async () => {
    Cocktail.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/cocktails/nope');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      mensaje: 'Receta no encontrada o aún no ha sido aceptada'
    });
  });

  it('500 on exception', async () => {
    Cocktail.findOne.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      mensaje: 'No fue posible conectarse al servidor. Por favor intente más tarde.'
    });
  });
});


describe('DELETE /api/v1/cocktails/:id', () => {
  it('404 if recipe does not exist', async () => {
    Cocktail.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(404);
  });

  it('400 if recipe not accepted', async () => {
    Cocktail.findByPk.mockResolvedValue({ status: 'pendiente de revision', save: jest.fn() });
    const res = await request(app).delete('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ mensaje: 'Solo se pueden eliminar recetas aceptadas' });
  });

  it('200 on success', async () => {
    const fake = { status: 'aceptada', save: jest.fn() };
    Cocktail.findByPk.mockResolvedValue(fake);
    const res = await request(app).delete('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(200);
    expect(fake.save).toHaveBeenCalled();
  });

  it('500 on exception', async () => {
    Cocktail.findByPk.mockRejectedValue(new Error());
    const res = await request(app).delete('/api/v1/cocktails/r1');
    expect(res.statusCode).toBe(500);
  });
});


describe('GET /api/v1/cocktails/pending', () => {
  it('200 returns pending list', async () => {
    const fake = [{ id: 5, ingredients: [], likes: [] }];
    Cocktail.findAll.mockResolvedValue(fake);
    const res = await request(app).get('/api/v1/cocktails/pending');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('500 on error', async () => {
    Cocktail.findAll.mockRejectedValue(new Error());
    const res = await request(app).get('/api/v1/cocktails/pending');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Error del servidor' });
  });
});


describe('PATCH /api/v1/cocktails/accept/:id', () => {
  it('404 if not exist', async () => {
    Cocktail.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/v1/cocktails/accept/r1');
    expect(res.statusCode).toBe(404);
  });

  it('409 on timestamp mismatch', async () => {
    const dt = new Date('2025-01-01');
    Cocktail.findByPk.mockResolvedValue({ updatedAt: dt, save: jest.fn() });
    const res = await request(app)
      .patch('/api/v1/cocktails/accept/r1')
      .send({ lastUpdated: '2025-01-02' });
    expect(res.statusCode).toBe(409);
  });

  it('200 on success', async () => {
    const now = new Date();
    const fake = { updatedAt: now, save: jest.fn() };
    Cocktail.findByPk.mockResolvedValue(fake);
    const res = await request(app)
      .patch('/api/v1/cocktails/accept/r1')
      .send({ lastUpdated: now.toISOString() });
    expect(res.statusCode).toBe(200);
    expect(fake.save).toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/cocktails/reject/:id', () => {
  it('404 if not exist', async () => {
    Cocktail.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/v1/cocktails/reject/r1');
    expect(res.statusCode).toBe(404);
  });

  it('409 on timestamp mismatch', async () => {
    const dt = new Date('2025-01-01');
    Cocktail.findByPk.mockResolvedValue({ updatedAt: dt, save: jest.fn() });
    const res = await request(app)
      .patch('/api/v1/cocktails/reject/r1')
      .send({ lastUpdated: '2025-01-02' });
    expect(res.statusCode).toBe(409);
  });

  it('200 on success', async () => {
    const now = new Date();
    const fake = { updatedAt: now, save: jest.fn() };
    Cocktail.findByPk.mockResolvedValue(fake);
    const res = await request(app)
      .patch('/api/v1/cocktails/reject/r1')
      .send({ lastUpdated: now.toISOString() });
    expect(res.statusCode).toBe(200);
    expect(fake.save).toHaveBeenCalled();
  });
});

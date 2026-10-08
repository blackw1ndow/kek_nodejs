describe('config', () => {
  const original = process.env.PORT;

  afterEach(() => {
    process.env.PORT = original;
    jest.resetModules();
  });

  test('бере порт з PORT', () => {
    process.env.PORT = '4000';
    expect(require('../../src/config').config.port).toBe(4000);
  });

  test('без PORT — порт за замовчуванням', () => {
    delete process.env.PORT;
    const { config, DEFAULT_PORT } = require('../../src/config');
    expect(config.port).toBe(DEFAULT_PORT);
  });
});
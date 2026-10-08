const DEFAULT_PORT = 3000;

const config = {
  port: Number(process.env.PORT) || DEFAULT_PORT,
};

module.exports = { config, DEFAULT_PORT };
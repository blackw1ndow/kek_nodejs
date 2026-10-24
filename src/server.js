require('dotenv').config();
const { createApp } = require('./app');
const { config } = require('./config');
const { settingsService } = require('./modules/settings/settings.service');

async function start() {
  await settingsService.load();
  createApp().listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

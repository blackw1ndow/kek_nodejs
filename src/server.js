require('dotenv').config();
const { createApp } = require('./app');
const { config } = require('./config');

createApp().listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
// Force nodemon reload: env updated
require('dotenv').config();
const { connectDB } = require('./src/config/db');
const app = require('./app');

async function start() {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Running on port ${PORT}`));
}

start().catch(err => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});

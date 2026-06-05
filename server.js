// Force nodemon reload: env updated
require('dotenv').config();
const dns = require('dns');

// Fix for querySrv ECONNREFUSED MongoDB Atlas SRV resolution issues on local networks/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('[SERVER] Configured public DNS resolvers for MongoDB connection.');
} catch (dnsErr) {
  console.warn('[SERVER] Warning: Could not set custom DNS servers:', dnsErr.message);
}

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

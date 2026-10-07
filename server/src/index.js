import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';
import { seed } from './seed.js';

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 5000;

const app = createApp();

let memoryServer = null;

async function start() {
  ({ memoryServer } = await connectDB());

  if (process.env.SEED_ON_START !== 'false') {
    try {
      await seed();
    } catch (err) {
      console.error('[seed] failed:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`\n🎬 Portfolio API running on http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   Admin:   ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}\n`);
  });
}

const shutdown = async () => {
  await disconnectDB(memoryServer);
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});

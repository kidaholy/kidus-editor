import dns from 'node:dns';
import mongoose from 'mongoose';

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set, use it (Atlas / local mongod).
 * - Otherwise start an in-memory MongoDB (dev mode only) so the app runs out of the box.
 */
export async function connectDB() {
  // Optional resolver override: some machines advertise a dead loopback DNS
  // (127.0.0.1) to Node, which breaks mongodb+srv SRV lookups. Set DNS_SERVERS
  // to a comma-separated list (e.g. 192.168.8.1,8.8.8.8) to bypass it.
  const dnsServers = (process.env.DNS_SERVERS || '').trim();
  if (dnsServers) {
    const servers = dnsServers.split(',').map((s) => s.trim()).filter(Boolean);
    if (servers.length) {
      dns.setServers(servers);
      console.log(`[db] DNS resolvers: ${servers.join(', ')}`);
    }
  }

  let uri = (process.env.MONGODB_URI || '').trim();
  let memoryServer = null;

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    // launchTimeout: first WiredTiger initialisation can exceed the 10s default.
    memoryServer = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
    uri = memoryServer.getUri(process.env.MONGO_DB_NAME || 'video_portfolio');
    console.log('[db] MONGODB_URI not set -> started in-memory MongoDB (dev mode)');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || 'video_portfolio' });
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  return { memoryServer };
}

export async function disconnectDB(memoryServer) {
  await mongoose.disconnect().catch(() => {});
  if (memoryServer) await memoryServer.stop().catch(() => {});
}

import { createApp } from './src/server/app.ts';
import { ConfigError, loadConfig } from './src/server/config.ts';
import { openDb } from './src/server/db.ts';

try {
  const config = loadConfig();
  const handle = await openDb(config);
  const app = createApp(handle.db, config);
  const server = app.listen(config.port, () => {
    console.log(`API ready on port ${config.port} (${config.env}, db: ${handle.kind})`);
  });
  const stop = () => server.close(() => void handle.close().finally(() => process.exit(0)));
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
} catch (e) {
  console.error(e instanceof ConfigError ? `Configuration error: ${e.message}` : e);
  process.exit(1);
}

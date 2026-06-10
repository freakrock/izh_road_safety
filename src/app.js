import Fastify from 'fastify';
import cors from '@fastify/cors';
import { eventRoutes } from './events/event.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  app.get('/health', async () => {
    return {
      ok: true,
      service: 'road-safety-izh'
    };
  });

  await app.register(eventRoutes);

  return app;
}

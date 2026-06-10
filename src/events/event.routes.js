import { config } from '../config.js';
import {
  approveEvent,
  ingestManualText,
  listAllEvents,
  listApprovedEvents,
  listCandidateEvents,
  rejectEvent
} from './event.service.js';

function checkAdminSecret(request, reply) {
  const secret = request.headers['x-admin-secret'];

  if (secret !== config.adminSecret) {
    reply.code(401).send({
      error: 'Unauthorized'
    });
    return false;
  }

  return true;
}

export async function eventRoutes(app) {
  app.get('/events', async () => {
    return listApprovedEvents();
  });

  app.get('/admin/events', async (request, reply) => {
    if (!checkAdminSecret(request, reply)) return;

    return listAllEvents();
  });

  app.get('/admin/events/candidates', async (request, reply) => {
    if (!checkAdminSecret(request, reply)) return;

    return listCandidateEvents();
  });

  app.post('/admin/ingest/manual', async (request, reply) => {
    if (!checkAdminSecret(request, reply)) return;

    const body = request.body || {};

    if (!body.text) {
      return reply.code(400).send({
        error: 'text is required'
      });
    }

    return ingestManualText({
      sourceName: body.sourceName,
      text: body.text
    });
  });

  app.post('/admin/events/:id/approve', async (request, reply) => {
    if (!checkAdminSecret(request, reply)) return;

    const { id } = request.params;

    const event = await approveEvent(id);

    if (!event) {
      return reply.code(404).send({
        error: 'Event not found'
      });
    }

    return event;
  });

  app.post('/admin/events/:id/reject', async (request, reply) => {
    if (!checkAdminSecret(request, reply)) return;

    const { id } = request.params;

    const event = await rejectEvent(id);

    if (!event) {
      return reply.code(404).send({
        error: 'Event not found'
      });
    }

    return event;
  });
}

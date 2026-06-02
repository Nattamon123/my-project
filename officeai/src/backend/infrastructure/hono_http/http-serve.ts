import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';
import { container } from '../config/container';
import { WebSocketController } from './controllers/WebSocketController';
import { config } from 'dotenv';
import { join } from 'path';

// Load env vars
config({ path: join(__dirname, '../../../../../.env.local') });

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// Resolve dependencies
const roomDebateUseCase = container.resolve('roomDebateUseCase');
const queueService = container.resolve('queueService');

const wsController = new WebSocketController(roomDebateUseCase, queueService);

// Health check route
app.get('/health', (c) => c.json({ status: 'ok', service: 'officeai-backend' }));

// WebSocket Route
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        wsController.handleConnection(ws);
      },
      onMessage(event, ws) {
        wsController.handleMessage(ws, event);
      },
      onClose(event, ws) {
        wsController.handleClose(ws);
      },
    };
  })
);

const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 4000;

console.log(`Standalone Backend Server starting on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port
});

injectWebSocket(server);

export default server;

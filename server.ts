/**
 * HaulSense - Full-Stack Express Server with SSE Agent Streaming
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { runAgentOrchestrator } from './src/agent/orchestrator';
import { ALL_SHIPMENTS } from './src/data/mockData';
import { AgentEvent, Shipment } from './src/types';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'HaulSense Backend',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // In-memory chat storage for active trips
  const tripChatStore: Record<string, any[]> = {
    'S-GOLDEN': [
      {
        id: 'msg-1',
        tripId: 'S-GOLDEN',
        senderRole: 'manager',
        senderId: 'MGR-001',
        senderName: 'Karthik Subramanian',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
        text: 'Ravi, FMCG pallet dispatch for S-GOLDEN is ready at Chennai Central Bay 4. Total weight 6.2T with 22 m³ volume. Tarp seal #CHN-9921 is allocated.',
        readByOtherRole: true,
      },
      {
        id: 'msg-2',
        tripId: 'S-GOLDEN',
        senderRole: 'driver',
        senderId: 'DRV-001',
        senderName: 'Ravi Kumar',
        timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
        text: 'Vanakkam Karthik sir. Arrived at Bay 4 with assigned truck TN 38 AB 4521. Pre-trip inspection completed, tire pressure and 24V engine diagnostics all green.',
        readByOtherRole: true,
      },
      {
        id: 'msg-3',
        tripId: 'S-GOLDEN',
        senderRole: 'manager',
        senderId: 'MGR-001',
        senderName: 'Karthik Subramanian',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        text: 'Superb. Consignee deadline in Bengaluru is 8:00 PM. HaulSense Agent also identified Return Load R1 (Bengaluru → Chennai) with ₹7,800 driver share. I have locked that backhaul for your truck.',
        readByOtherRole: true,
      },
      {
        id: 'msg-4',
        tripId: 'S-GOLDEN',
        senderRole: 'driver',
        senderId: 'DRV-001',
        senderName: 'Ravi Kumar',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        text: 'Thank you sir! Return haul R1 is perfect. Fits our 7.5T closed hold. Loading completed, gate pass verified. Departing Chennai via NH-48 corridor.',
        attachmentType: 'location_pin',
        attachmentTitle: 'Current GPS Pin',
        attachmentData: 'NH-48 Sriperumbudur Tollway (Lat: 12.9821, Lng: 79.9412)',
        readByOtherRole: true,
      },
    ],
  };

  // GET /api/chat/:tripId - Fetch messages for specific corridor trip
  app.get('/api/chat/:tripId', (req, res) => {
    const { tripId } = req.params;
    const messages = tripChatStore[tripId] || [];
    res.json({ ok: true, tripId, messages });
  });

  // POST /api/chat/:tripId - Send a new message between Driver and Manager
  app.post('/api/chat/:tripId', (req, res) => {
    const { tripId } = req.params;
    const { senderRole, senderId, senderName, text, attachmentType, attachmentTitle, attachmentData } = req.body;

    if (!text && !attachmentData) {
      res.status(400).json({ ok: false, error: 'Message text or attachment is required.' });
      return;
    }

    if (!tripChatStore[tripId]) {
      tripChatStore[tripId] = [];
    }

    const newMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tripId,
      senderRole: senderRole || 'manager',
      senderId: senderId || 'MGR-001',
      senderName: senderName || (senderRole === 'driver' ? 'Ravi Kumar' : 'Karthik Subramanian'),
      timestamp: new Date().toISOString(),
      text: text || '',
      attachmentType,
      attachmentTitle,
      attachmentData,
      readByOtherRole: false,
    };

    tripChatStore[tripId].push(newMessage);
    res.json({ ok: true, message: newMessage });
  });

  // POST /api/agent/run - Streams agent reasoning events via Server-Sent Events
  app.post('/api/agent/run', async (req, res) => {
    const { shipmentId, userQuestion } = req.body;

    let targetShipment: Shipment | undefined;
    if (typeof req.body.shipment === 'object' && req.body.shipment !== null) {
      targetShipment = req.body.shipment;
    } else if (shipmentId) {
      targetShipment = ALL_SHIPMENTS.find((s) => s.id === shipmentId);
    }

    if (!targetShipment) {
      res.status(404).json({ error: `Shipment '${shipmentId}' not found.` });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const abortController = new AbortController();

    res.on('close', () => {
      if (!res.writableFinished) {
        abortController.abort();
      }
    });

    const sendEvent = (event: AgentEvent) => {
      if (res.writableEnded) return;
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      await runAgentOrchestrator({
        shipment: targetShipment,
        userQuestion: userQuestion || 'Should we accept this shipment?',
        onEvent: sendEvent,
        apiKey: process.env.GEMINI_API_KEY,
        abortSignal: abortController.signal,
      });
    } catch (err: any) {
      if (!res.writableEnded) {
        sendEvent({
          type: 'error',
          message: `Server execution exception: ${err?.message || String(err)}`,
        });
      }
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // Mount Vite middleware in development or serve static in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HaulSense] Server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[HaulSense] Fatal error starting server:', err);
  process.exit(1);
});

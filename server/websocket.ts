import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

export interface WebSocketClient {
  ws: WebSocket;
  tenantId: string;
  userId?: string;
  rooms: Set<string>;
}

const clients = new Map<WebSocket, WebSocketClient>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: any) => {
    console.log("WebSocket client connected");

    // Extract tenantId from URL query or headers
    const url = req.url || "";
    const params = new URLSearchParams(url.split("?")[1]);
    const tenantId = params.get("tenantId");

    if (!tenantId) {
      ws.close(1008, "No tenantId provided");
      return;
    }

    // Register client
    const client: WebSocketClient = {
      ws,
      tenantId,
      rooms: new Set(),
    };
    clients.set(ws, client);

    console.log(`Client connected for tenant: ${tenantId}`);

    // Handle messages
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      clients.delete(ws);
      console.log(`Client disconnected for tenant: ${tenantId}`);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({ type: "connected", tenantId }));
  });

  return wss;
}

function handleMessage(client: WebSocketClient, message: any) {
  const { type, room } = message;

  switch (type) {
    case "subscribe":
      if (room) {
        client.rooms.add(room);
        console.log(`Client subscribed to room: ${room}`);
      }
      break;

    case "unsubscribe":
      if (room) {
        client.rooms.delete(room);
        console.log(`Client unsubscribed from room: ${room}`);
      }
      break;

    default:
      console.log("Unknown message type:", type);
  }
}

export function broadcastToTenant(
  tenantId: string,
  room: string,
  event: string,
  data: any
) {
  const message = JSON.stringify({
    type: "update",
    event,
    room,
    data,
    timestamp: new Date().toISOString(),
  });

  let broadcastCount = 0;
  clients.forEach((client, ws) => {
    if (client.tenantId === tenantId && client.rooms.has(room)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        broadcastCount++;
      }
    }
  });

  console.log(
    `Broadcast to ${broadcastCount} clients - Room: ${room}, Event: ${event}`
  );
}

export function broadcastToUser(
  tenantId: string,
  userId: string,
  event: string,
  data: any
) {
  const message = JSON.stringify({
    type: "personal",
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  let broadcastCount = 0;
  clients.forEach((client, ws) => {
    if (client.tenantId === tenantId && client.userId === userId) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        broadcastCount++;
      }
    }
  });

  console.log(
    `Broadcast to user ${userId} - Event: ${event}, Count: ${broadcastCount}`
  );
}

export function broadcastPayrollUpdate(tenantId: string, data: any) {
  broadcastToTenant(tenantId, "payroll", "status-update", data);
}

export function broadcastAssignmentUpdate(tenantId: string, data: any) {
  broadcastToTenant(tenantId, "assignments", "status-update", data);
}

export function broadcastGarnishmentUpdate(tenantId: string, data: any) {
  broadcastToTenant(tenantId, "garnishments", "status-update", data);
}

export function broadcastDocumentUpload(tenantId: string, data: any) {
  broadcastToTenant(tenantId, "documents", "document-uploaded", data);
}

export function broadcastComplianceUpdate(tenantId: string, data: any) {
  broadcastToTenant(tenantId, "compliance", "status-update", data);
}

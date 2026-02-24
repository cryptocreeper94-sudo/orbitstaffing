import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verifyToken } from "./trustlayer-sso";
import { db } from "./db";
import { chatMessages, chatChannels, chatUsers } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

interface ChatClient {
  ws: WebSocket;
  userId: string;
  username: string;
  avatarColor: string;
  role: string;
  channelId: string | null;
}

const clients = new Map<WebSocket, ChatClient>();

function broadcast(channelId: string, message: object, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.channelId === channelId && client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

function getPresence() {
  const channelUsers: Record<string, string[]> = {};
  let onlineCount = 0;
  const seenUsers = new Set<string>();

  clients.forEach((client) => {
    if (!seenUsers.has(client.userId)) {
      onlineCount++;
      seenUsers.add(client.userId);
    }
    if (client.channelId) {
      if (!channelUsers[client.channelId]) channelUsers[client.channelId] = [];
      if (!channelUsers[client.channelId].includes(client.username)) {
        channelUsers[client.channelId].push(client.username);
      }
    }
  });

  return { type: "presence", onlineCount, channelUsers };
}

export function setupChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "join") {
          const decoded = verifyToken(msg.token);
          if (!decoded) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
            return;
          }

          const [user] = await db.select().from(chatUsers).where(eq(chatUsers.id, decoded.userId)).limit(1);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "User not found" }));
            return;
          }

          const channelId = msg.channelId || "general";
          clients.set(ws, {
            ws,
            userId: user.id,
            username: user.username,
            avatarColor: user.avatarColor,
            role: user.role,
            channelId,
          });

          await db.update(chatUsers).set({ isOnline: true }).where(eq(chatUsers.id, user.id));

          const messages = await db.select({
            id: chatMessages.id,
            channelId: chatMessages.channelId,
            userId: chatMessages.userId,
            content: chatMessages.content,
            replyToId: chatMessages.replyToId,
            createdAt: chatMessages.createdAt,
          }).from(chatMessages)
            .where(eq(chatMessages.channelId, channelId))
            .orderBy(desc(chatMessages.createdAt))
            .limit(50);

          ws.send(JSON.stringify({ type: "history", messages: messages.reverse() }));

          broadcast(channelId, {
            type: "user_joined",
            userId: user.id,
            username: user.username,
          }, ws);

          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(JSON.stringify(getPresence()));
            }
          });
        }

        if (msg.type === "switch_channel") {
          const client = clients.get(ws);
          if (!client) return;

          const oldChannel = client.channelId;
          client.channelId = msg.channelId;

          if (oldChannel) {
            broadcast(oldChannel, { type: "user_left", userId: client.userId, username: client.username });
          }

          const messages = await db.select({
            id: chatMessages.id,
            channelId: chatMessages.channelId,
            userId: chatMessages.userId,
            content: chatMessages.content,
            replyToId: chatMessages.replyToId,
            createdAt: chatMessages.createdAt,
          }).from(chatMessages)
            .where(eq(chatMessages.channelId, msg.channelId))
            .orderBy(desc(chatMessages.createdAt))
            .limit(50);

          ws.send(JSON.stringify({ type: "history", messages: messages.reverse() }));

          broadcast(msg.channelId, {
            type: "user_joined",
            userId: client.userId,
            username: client.username,
          }, ws);

          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(JSON.stringify(getPresence()));
            }
          });
        }

        if (msg.type === "message") {
          const client = clients.get(ws);
          if (!client || !client.channelId) return;

          let content = (msg.content || "").trim();
          if (!content || content.length > 2000) return;

          const [saved] = await db.insert(chatMessages).values({
            channelId: client.channelId,
            userId: client.userId,
            content,
            replyToId: msg.replyToId || null,
          }).returning();

          broadcast(client.channelId, {
            type: "message",
            id: saved.id,
            channelId: saved.channelId,
            userId: client.userId,
            username: client.username,
            avatarColor: client.avatarColor,
            role: client.role,
            content: saved.content,
            replyToId: saved.replyToId,
            createdAt: saved.createdAt,
          });
        }

        if (msg.type === "typing") {
          const client = clients.get(ws);
          if (!client || !client.channelId) return;
          broadcast(client.channelId, {
            type: "typing",
            userId: client.userId,
            username: client.username,
          }, ws);
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", async () => {
      const client = clients.get(ws);
      if (client) {
        if (client.channelId) {
          broadcast(client.channelId, {
            type: "user_left",
            userId: client.userId,
            username: client.username,
          });
        }
        await db.update(chatUsers)
          .set({ isOnline: false, lastSeen: new Date() })
          .where(eq(chatUsers.id, client.userId))
          .catch(() => {});
        clients.delete(ws);

        wss.clients.forEach((c) => {
          if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify(getPresence()));
          }
        });
      }
    });
  });

  return wss;
}

import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express, type Request } from "express";

import runApp from "./app";
import { setupWebSocket } from "./websocket";

export async function serveStatic(app: Express, server: Server) {
  // Setup WebSocket for real-time updates
  setupWebSocket(server);
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve attached_assets folder for images, emblems, hallmarks
  const attachedAssetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
  app.use('/attached_assets', express.static(attachedAssetsPath));

  // Serve React app for /studio path - ProductsGallery component handles the UI
  app.get('/studio', (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    // All domains now use the React app (index.html)
    // The React Router handles /studio path to show ProductsGallery component
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();

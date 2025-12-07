import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express, type Request } from "express";

import runApp from "./app";
import { setupWebSocket } from "./websocket";
import { versionManager } from "./versionManager";

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
  
  // Delay auto-publish to let health checks pass first
  setTimeout(async () => {
    console.log('[Startup] Running background auto-publish...');
    try {
      const result = await versionManager.publishRelease('patch');
      console.log(`[Startup] ✅ Published ORBIT Staffing OS v${result.version}`);
      console.log(`[Startup] ✅ Solana Hash: ${result.hash.substring(0, 16)}...`);
      if (result.solanaResult) {
        console.log(`[Startup] ✅ TX: ${result.solanaResult.transactionSignature}`);
      }
    } catch (error) {
      console.log('[Startup] Auto-publish skipped (non-critical)');
    }
  }, 10000); // Wait 10 seconds after startup
})();

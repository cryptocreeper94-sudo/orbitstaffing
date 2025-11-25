import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express, type Request } from "express";

import runApp from "./app";

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve DarkWave Studios landing page at /studio path
  app.get('/studio', (_req, res) => {
    res.sendFile(path.resolve(distPath, "studio-landing.html"));
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    // Log hostname for debugging
    console.log('Request:', req.method, req.path);
    console.log('Hostname:', req.hostname);
    console.log('Host header:', req.headers.host);
    
    // Check multiple possible hostname headers for darkwavestudios.io
    const hostname = req.hostname || req.headers.host || req.headers['x-forwarded-host'] || '';
    
    // Serve Dark Wave Studios landing page for darkwavestudios.io
    if (hostname.includes('darkwavestudios.io')) {
      console.log('✅ Serving landing page for darkwavestudios.io');
      return res.sendFile(path.resolve(distPath, "studio-landing.html"));
    }
    
    // Serve ORBIT app for all other domains
    console.log('📱 Serving ORBIT app');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();

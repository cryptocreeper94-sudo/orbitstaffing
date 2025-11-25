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

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    // Log hostname for debugging (can be removed later)
    console.log('Hostname received:', req.hostname);
    console.log('Host header:', req.headers.host);
    console.log('X-Forwarded-Host:', req.headers['x-forwarded-host']);
    
    // Check multiple possible hostname headers for darkwavestudios.io
    const hostname = req.hostname || req.headers.host || req.headers['x-forwarded-host'] || '';
    
    // Serve Dark Wave Studios landing page for darkwavestudios.io
    if (hostname.includes('darkwavestudios.io')) {
      console.log('Serving landing page for darkwavestudios.io');
      return res.sendFile(path.resolve(distPath, "studio-landing.html"));
    }
    
    // Serve ORBIT app for all other domains
    console.log('Serving ORBIT app');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();

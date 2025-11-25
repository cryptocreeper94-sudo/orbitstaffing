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
    // Serve Dark Wave Studios landing page for darkwavestudios.io
    if (req.hostname === 'darkwavestudios.io' || req.hostname === 'www.darkwavestudios.io') {
      return res.sendFile(path.resolve(distPath, "studio-landing.html"));
    }
    // Serve ORBIT app for all other domains
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();

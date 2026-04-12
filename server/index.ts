process.on('unhandledRejection', (err) => { console.error('[FATAL] Unhandled rejection:', err); });
process.on('uncaughtException', (err) => { console.error('[FATAL] Uncaught exception:', err); process.exit(1); });

import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import express, { type Express } from "express";
import { nanoid } from "nanoid";
import { createServer as createViteServer, createLogger } from "vite";

import runApp from "./app";
import { setupWebSocket } from "./websocket";
import { setupChatWebSocket } from "./chat-ws";
import { versionManager } from "./versionManager";

const viteLogger = createLogger();

export async function setupServer(app: Express, server: Server) {
  setupWebSocket(server);
  setupChatWebSocket(server);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, "public");

    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
    }

    app.use(express.static(distPath));

    const attachedAssetsPath = path.resolve(__dirname, "..", "attached_assets");
    app.use('/attached_assets', express.static(attachedAssetsPath));

    app.get('/studio', (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });

    app.use("/:path(*)", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    };

    const viteConfig = await import("../vite.config");
    const vite = await createViteServer({
      ...viteConfig.default,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("/:path(*)", async (req, res, next) => {
      const url = req.originalUrl;
      
      if (url.startsWith('/api/')) {
        return next();
      }

      try {
        const clientTemplate = path.resolve(
          __dirname,
          "..",
          "client",
          "index.html",
        );

        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }
}

(async () => {
  await runApp(setupServer);
  
  if (process.env.NODE_ENV === 'production') {
    setTimeout(async () => {
      console.log('[Startup] Running background auto-publish...');
      try {
        const result = await versionManager.publishRelease('patch');
        console.log(`[Startup] Published ORBIT Staffing OS v${result.version}`);
        console.log(`[Startup] TrustVault Hash: ${result.hash.substring(0, 16)}...`);
        if (result.blockchainResult) {
          console.log(`[Startup] TX: ${result.blockchainResult.transactionSignature}`);
        }
      } catch (error) {
        console.log('[Startup] Auto-publish skipped (non-critical)');
      }
    }, 10000);
  }
})();

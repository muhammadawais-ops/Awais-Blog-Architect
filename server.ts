
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import generateHandler from "./api/generate";

const app = express();
const PORT = 3000;
const SERVER_TIMEOUT = 120000; // 2 minutes

// 1. Listen immediately to signal readiness to the platform
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[${new Date().toISOString()}] Server started and listening on http://0.0.0.0:${PORT}`);
});

server.timeout = SERVER_TIMEOUT;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Process Error Handling
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

// API Route for Content Generation
app.post("/api/generate", async (req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${new Date().toISOString()}] [${requestId}] Generation request received`);
  
  try {
    // Set response timeout
    res.setTimeout(SERVER_TIMEOUT, () => {
      console.error(`[${requestId}] Request timed out at server level`);
      if (!res.headersSent) {
        res.status(504).json({ error: "The AI is taking too long to research and write. Please try a shorter word count or a simpler topic." });
      }
    });

    await generateHandler(req as any, res as any);
    console.log(`[${new Date().toISOString()}] [${requestId}] Request completed`);
  } catch (error: any) {
    console.error(`[${requestId}] Generation Handler Error:`, error);
    next(error);
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: err.message || "Internal Server Error",
      type: err.name || "Error"
    });
  }
});

async function setupVite() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, "dist");

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded successfully");
    } catch (e) {
      console.error("CRITICAL: Failed to load Vite middleware:", e);
    }
  }
}

setupVite().catch(err => {
  console.error("CRITICAL: Failed to setup Vite:", err);
});

export default app;


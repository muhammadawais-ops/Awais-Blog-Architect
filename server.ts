
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import generateHandler from "./api/generate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API Route for Content Generation (Local)
app.post("/api/generate", async (req, res) => {
  // Use the same handler as Vercel for consistency
  return generateHandler(req as any, res as any);
});

// Serve static files
const distPath = path.join(__dirname, "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Setup Vite in dev mode
  const setupDev = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  setupDev();
}

// Only listen if not on Vercel
if (process.env.VERCEL !== "1") {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;


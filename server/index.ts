import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

import { storage } from "./storage";

const app = express();

// Dynamic CORS for scalable client embedding
const corsOptions = {
  origin: async (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // If no origin (like a server-side request or direct browser hit), allow it
    if (!origin) return callback(null, true);
    
    try {
      const site = await storage.getExternalSiteByOrigin(origin);
      if (site && site.isEnabled) {
        return callback(null, true);
      }
      
      // Also allow the primary frontend
      const allowedStaticOrigins = ["https://e-mart-1-mfge.onrender.com", "http://localhost:5000", "http://localhost:5173", "http://127.0.0.1:5000"];
      if (allowedStaticOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    } catch (err) {
      callback(err as Error);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  // Silent logs as per user request
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // No JSON body logging for production clean output

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";


    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

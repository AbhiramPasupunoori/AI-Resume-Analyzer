import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import apiHandler from "./api/[...path].js";

function localApi() {
  return {
    name: "local-vercel-api",
    configureServer(server) {
      server.middlewares.use("/api", async (request, response) => {
        const url = new URL(request.url || "/", "http://localhost");
        request.query = {
          path: url.pathname.split("/").filter(Boolean),
        };

        response.status = (statusCode) => {
          response.statusCode = statusCode;
          return response;
        };
        response.json = (body) => {
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(body));
        };

        try {
          await apiHandler(request, response);
        } catch (error) {
          server.config.logger.error(error);
          if (!response.headersSent) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
          }
          if (!response.writableEnded) {
            response.end(JSON.stringify({ detail: error.message }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Vite exposes only VITE_* values to browser code. These unprefixed values
  // remain in the local Node process for the server-side API handler.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  process.env.LOCAL_JSON_STORAGE = "true";

  return {
    plugins: [react(), localApi()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});

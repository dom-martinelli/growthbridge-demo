import { defineConfig } from "vite";
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";

const publicBasePath = normalizeBasePath(process.env.PUBLIC_BASE_PATH);

export default defineConfig({
  base: publicBasePath,
  plugins: [basicSsl()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        launch: resolve(__dirname, "launch.html")
      }
    }
  },
  server: {
    host: "localhost",
    https: true,
    port: 5173,
    strictPort: true
  }
});

function normalizeBasePath(value?: string): string {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

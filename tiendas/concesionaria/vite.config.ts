import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5174,
    proxy: {
      // El backend resuelve la tienda por el header Host. Con
      // changeOrigin en false el proxy manda el Host original
      // ("autos.localhost:5174"), el backend le saca el puerto y encuentra el
      // tenant. Es lo mismo que va a hacer nginx en produccion, asi que en dev
      // se prueba el mismo camino y de paso no hace falta CORS.
      //
      // Importante: hay que entrar por http://autos.localhost:5174, NO por
      // localhost:5174, porque si no cae en la tienda equivocada.
      "/store": {
        target: "http://localhost:8000",
        changeOrigin: false,
      },
    },
  },
});

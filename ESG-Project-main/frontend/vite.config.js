import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    /* host,port,strictport 설정은 JAVA 컨트롤러
      @CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
      (프론트서버 5173으로 고정)
    */
  },
});

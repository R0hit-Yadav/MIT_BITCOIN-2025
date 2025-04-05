import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external access
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      // Add your Ngrok URL here, for example:
      clientUrl: 'https://51f2-2402-a00-404-24e9-fd06-73a1-d93a-96ce.ngrok-free.app'
    },
    allowedHosts: ['.ngrok-free.app']
  },
})

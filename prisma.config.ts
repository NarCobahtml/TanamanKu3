import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL, // Gunakan koneksi langsung Port 5432 untuk CLI
  },
});

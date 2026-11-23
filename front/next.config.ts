import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Servidor próprio e só as dependências usadas, para a imagem Docker (front/Dockerfile)
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Variáveis de ambiente com valores padrão
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.10:8765',
    NEXT_PUBLIC_EXTERNAL_BACKEND_URL: process.env.NEXT_PUBLIC_EXTERNAL_BACKEND_URL || 'http://localhost:8765',
  },

  // Configuração de CORS atualizada
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === 'production'
              ? "http://192.168.1.10:8765" // Seu IP externo em produção
              : "http://localhost:8765"
          },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },

  // Rewrites apenas para desenvolvimento
  async rewrites() {
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/auth/:path*',
          destination: 'http://localhost:8765/auth/:path*',
        },
        {
          source: '/avaliacao/:path*',
          destination: 'http://localhost:8765/avaliacao/:path*',
        },
      ];
    }
    return [];
  },

  // Configuração do Webpack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Otimizações para produção
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output standalone para Docker
  output: 'standalone',

  // Permitir variáveis de ambiente vazias se necessário
  experimental: {},
};

export default nextConfig;
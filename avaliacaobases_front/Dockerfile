# 1. Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Gerar build de produção
RUN npm run build

# 2. Production stage
FROM node:18-alpine
WORKDIR /app

# Variáveis no runtime também!
ENV NEXT_PUBLIC_API_URL=http://gateway:8765
ENV NEXT_PUBLIC_BACKEND_URL=http://gateway:8765

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
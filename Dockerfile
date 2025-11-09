# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Production
FROM node:18-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Add non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Set user
USER nodejs

# Expose port (Render will use PORT env variable)
EXPOSE 5002

# Environment variable
ENV PORT=5002

# Health check - use PORT env variable
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start the application
CMD ["node", "server.js"]

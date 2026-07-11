# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install serve to host the static files
RUN npm install -g serve

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Set default port to 8080 (Cloud Run's default)
ENV PORT=8080
EXPOSE 8080

# Start the server on the port specified by the PORT environment variable
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]

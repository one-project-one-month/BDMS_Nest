# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm (since your package.json specifies pnpm)
RUN npm install -g pnpm

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./
# Copy prisma schema so client can be generated during install
COPY prisma ./prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and Build the NestJS app
RUN pnpm prisma generate
RUN pnpm run build

# Stage 3: Runner (Production Image)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm for production-only pruning
RUN npm install -g pnpm

# Copy only what is needed to run the app
COPY --from=builder /app/package.json ./
# Use pnpm-lock.yaml instead of package-lock.json
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances système pour Prisma/Native modules
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Installer netcat pour l'entrypoint
RUN apk add --no-cache netcat-openbsd

# Copier seulement les fichiers nécessaires du builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Définir l'environnement
ENV NODE_ENV=production

EXPOSE 3333

ENTRYPOINT ["docker-entrypoint.sh"]

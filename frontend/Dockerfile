# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Optimisation du cache pour npm install
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production (Image légère)
FROM node:20-slim AS runner

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Installer seulement les dépendances nécessaires pour preview
RUN npm install -g vite

EXPOSE 4173

# Utiliser preview pour servir le build
CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "4173"]

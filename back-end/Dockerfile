FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 3333

# Démarrer l'application
CMD ["npm", "run", "dev"]

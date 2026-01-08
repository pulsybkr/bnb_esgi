#!/bin/sh

# Attendre que la base de données soit prête
echo "⏳ Waiting for database to be ready..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ Database is ready!"

# Exécuter les migrations Prisma
echo "🚀 Running Prisma migrations..."
npx prisma migrate deploy

# Exécuter le seeding
echo "🌱 Running database seeding..."
npm run prisma:seed

# Démarrer l'application
echo "🏁 Starting application..."
npm start

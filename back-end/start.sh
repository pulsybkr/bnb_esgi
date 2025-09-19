#!/bin/bash

echo "🚀 Démarrage du backend bnb..."

echo "⏳ Attente de la base de données PostgreSQL..."
until nc -z postgres 5432; do
  echo "PostgreSQL n'est pas encore prêt, nouvelle tentative dans 2 secondes..."
  sleep 2
done

echo "✅ Base de données PostgreSQL disponible!"

echo "🔄 Exécution des migrations bnb..."
npm run migration:run

if [ -d "database/seeders" ] && [ "$(ls -A database/seeders 2>/dev/null)" ]; then
  echo "🌱 Exécution des seeds bnb..."
  npm run db:seed
else
  echo "ℹ️  Aucun seed trouvé, on continue bnb..."
fi

echo "🎯 Lancement du serveur de développement bnb..."

exec npm run dev
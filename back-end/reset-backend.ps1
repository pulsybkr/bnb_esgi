# Script de réinitialisation complète du backend

Write-Host "🔄 Réinitialisation du backend..." -ForegroundColor Yellow

# Arrêter tous les processus Node.js du backend
Write-Host "⏹️  Arrêt des processus Node.js..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*back-end*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Supprimer node_modules
Write-Host "🗑️  Suppression de node_modules..." -ForegroundColor Cyan
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Supprimer le client Prisma généré
Write-Host "🗑️  Suppression du client Prisma..." -ForegroundColor Cyan
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Nettoyer le cache npm
Write-Host "🧹 Nettoyage du cache npm..." -ForegroundColor Cyan
npm cache clean --force

# Réinstaller les dépendances
Write-Host "📦 Réinstallation des dépendances..." -ForegroundColor Cyan
npm install

# Régénérer le client Prisma
Write-Host "⚙️  Génération du client Prisma..." -ForegroundColor Cyan
npx prisma generate

Write-Host "✅ Réinitialisation terminée !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant lancer: npm run dev" -ForegroundColor Yellow

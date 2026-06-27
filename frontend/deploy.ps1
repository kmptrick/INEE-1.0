# Déploiement INEE — frontend + backend
# Lancer avec : powershell -ExecutionPolicy Bypass -File "C:\PERSO\INEE 1.0\frontend\deploy.ps1"

Set-Location "C:\PERSO\INEE 1.0"

# Nettoyer un éventuel verrou git obsolète
Remove-Item ".git\index.lock" -ErrorAction SilentlyContinue

git add .
git commit -m "feat: interets de retard Loi LU 18/04/2004 (11,15%/an + forfait 40EUR des J+15), emails facturation via sendBilling, annulation demande de conge, dictee vocale ChatBot"
git push
Write-Host "Push GitHub termine" -ForegroundColor Green

Write-Host "Deploiement sur le serveur..." -ForegroundColor Yellow
ssh root@app.inee.lu "cd /opt/inee && git pull && docker compose build --no-cache backend && docker compose up -d backend && cd frontend && NEXT_PUBLIC_API_URL=https://app.inee.lu/api npx next build --webpack && pm2 restart inee-frontend"
Write-Host "Deploiement termine !" -ForegroundColor Green

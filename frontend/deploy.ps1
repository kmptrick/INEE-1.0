Set-Location "C:\PERSO\INEE 1.0"
git add .
git commit -m "fix: bouton NC masqué si DRAFT + ServicePicker à gauche NC + couleurs allégées"
git push
Write-Host "Push GitHub termine" -ForegroundColor Green
Write-Host "Deploiement sur le serveur..." -ForegroundColor Yellow
ssh root@app.inee.lu "cd /opt/inee && git pull && docker compose build --no-cache backend && docker compose up -d backend && cd frontend && NEXT_PUBLIC_API_URL=https://app.inee.lu/api npx next build --webpack && pm2 restart inee-frontend"
Write-Host "Deploiement termine !" -ForegroundColor Green

@echo off
title PolicyFit Frontend Dev Server
cd /d "D:\codings\policy-search-frontend"
echo ========================================================
echo   Starting PolicyFit Frontend Server (Next.js)...
echo   URL: http://localhost:3000
echo ========================================================
start "" "http://localhost:3000"
"C:\Program Files\nodejs\node.exe" ./node_modules/next/dist/bin/next dev -p 3000
pause

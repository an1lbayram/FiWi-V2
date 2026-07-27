@echo off
title FiWi V2 - Web Based Wi-Fi & Network Manager
color 0A
echo  ******************************************************
echo                       FiWi V2
echo       Web Based Wi-Fi & Network Intelligence Manager
echo               ^</^> Created by an1lbayram
echo  ******************************************************
echo.

cd /d "%~dp0server"
if not exist "node_modules" (
    echo [~] Sunucu bagimliliklari yukleniyor... (Server dependencies)
    call npm install
)

cd /d "%~dp0client"
if not exist "dist" (
    echo [~] Istemci uygulamasi derleniyor... (Building frontend)
    if not exist "node_modules" call npm install
    call npm run build
)

echo [~] FiWi V2 arka plan servisi baslatiliyor...
cd /d "%~dp0server"
start /B node index.js
echo [i] Sunucu baslatildi (http://localhost:3002)
echo [~] Arayuz tarayicida aciliyor...
timeout /t 2 >nul
start http://localhost:3002
echo.
echo [+] FiWi V2 basariyla calisiyor.
echo [!] Cikmak icin bu pencereyi kapatabilirsiniz.
pause >nul

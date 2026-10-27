@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo Starting Blue Archive Unowned Student Checker...
npm run dev
pause

@echo off
echo ===========================================
echo    ID Card Generation System - Launcher    
echo ===========================================

IF NOT EXIST "node_modules" (
    echo Installing required libraries (First run only)...
    call npm install
)

echo Building the application...
call npm run build

echo -------------------------------------------
echo System is starting...
echo Open your browser to: http://localhost:3000
echo -------------------------------------------
npm start
pause

@echo off
setlocal enabledelayedexpansion

echo =======================================
echo Detecting local IPv4 address...
echo =======================================

REM Get the first non-loopback IPv4 address (ignoring 127.0.0.1)
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4" ^| findstr /V "127.0.0.1"') do (
    set IP=%%A
    set IP=!IP: =!
)

echo Found IPv4: !IP!

REM Define the new API URL dynamically
set NEW_URL=https://!IP!:3562/api/v1/

echo =======================================
echo Updating Angular environment files...
echo =======================================

REM Replace apiURL in environment.ts
powershell -Command "(Get-Content src/environments/environment.ts) -replace 'apiURL:\".*\"', 'apiURL:\"!IP!\"' | Set-Content src/environments/environment.ts"

REM Replace apiURL in environment.prod.ts
powershell -Command "(Get-Content src/environments/environment.prod.ts) -replace 'apiURL:\".*\"', 'apiURL:\"!IP!\"' | Set-Content src/environments/environment.prod.ts"

echo Updated both environment files with: %NEW_URL%

echo =======================================
echo Starting Angular development server...
echo =======================================
call npx ng serve --host 0.0.0.0 --disable-host-check
REM Set the folder path where your Angular project is located
SET PROJECT_DIR=D:\HRMS MASTER\HRMS_Main_Repo\server\HRMS_Server

REM Navigate to the project directory
cd /d "%PROJECT_DIR%"
REM Run the Server app
echo Starting Server app...
npm run dev
endlocal
pause

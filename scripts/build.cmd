@echo off

echo Start set ENV
set /P TAURI_PRIVATE_KEY=<%HOMEPATH%\.tauri\hanzi_tools.key
set TAURI_KEY_PASSWORD=

if "%TAURI_PRIVATE_KEY%" == "" (
    echo ERROR: tauri private key not exist
    exit /b 1
)

set TAURI_PRIVATE_KEY
set TAURI_KEY_PASSWORD

echo ----------------------------------------
echo Start to build the app
call pnpm tauri build

pause

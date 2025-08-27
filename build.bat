@echo off
setlocal

:: =================================================================
::            DevInsight - Fullstack Build Script (v5 - Final Fix)
:: =================================================================
::
:: This script uses the 'CALL' command to ensure control returns
:: to the script after pnpm completes.
::
:: =================================================================

echo.
echo [INFO] Starting the fullstack build process...
echo.

:: --- Step 1: Build the frontend application ---
echo [STEP 1/4] Building frontend assets by pointing directly to the 'frontend' directory...

:: Use 'CALL' to execute the pnpm script and ensure control returns to this script.
CALL pnpm --dir frontend run build

:: Check if the frontend build was successful.
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed! Aborting.
    goto end
)

echo [SUCCESS] Frontend build completed successfully.
echo.

:: --- Step 2: Clean the old backend resource directory ---
echo [STEP 2/4] Cleaning the old resource directory in the backend...
if exist "backend\public" (
    rmdir /s /q "backend\public"
    echo [INFO] Old resource directory removed.
) else (
    echo [INFO] No old resource directory to clean.
)
echo.

:: --- Step 3: Copy frontend artifacts to the backend ---
echo [STEP 3/4] Copying frontend build output (dist) to backend/resource...
xcopy "frontend\dist" "backend\public" /s /e /y /i

:: Check if the copy was successful.
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy frontend artifacts! Aborting.
    goto end
)

echo [SUCCESS] Frontend artifacts copied successfully.
echo.

:: --- Step 4: Build the backend application ---
echo [STEP 4/4] Building the Rust application by pointing directly to the 'backend' Cargo.toml...

:: cargo is an .exe, so it doesn't strictly need CALL, but it's harmless to add.
cargo build --release --manifest-path backend\Cargo.toml
:: cross  build --release --manifest-path backend\Cargo.toml  --target x86_64-unknown-linux-gnu	

:: Check if the backend build was successful.
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed! Aborting.
    goto end
)

echo [SUCCESS] Backend build completed successfully.
echo.

:: --- Success ---
echo =================================================================
echo.
echo           BUILD SUCCEEDED!
echo.
echo The final executable can be found in:
echo backend\target\release\
echo.
echo =================================================================
goto end

:end
echo.
pause
endlocal
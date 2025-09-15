@echo off
echo Installing Credit Card Expense Tracker...
echo.

echo Step 1: Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing root dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Step 3: Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ Installation completed successfully!
echo.
echo Next steps:
echo 1. Update backend/.env with your MongoDB URI and JWT secret
echo 2. Update frontend/.env with your Google Client ID (optional)
echo 3. Run 'npm run dev' to start the application
echo.
pause

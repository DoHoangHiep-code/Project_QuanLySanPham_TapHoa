@echo off
echo ========================================
echo   CHAY SEED DATA - TAO DU LIEU MAU
echo ========================================
echo.
echo Dang chay seed data...
echo.

node src/utils/seed.js

echo.
echo ========================================
echo   HOAN TAT!
echo ========================================
echo.
echo Ban co the dang nhap voi:
echo   Admin: username=admin, password=admin123
echo   Staff: username=staff, password=staff123
echo.
pause


@echo off
chcp 65001 >nul
echo ========================================
echo   自动安装 Git for Windows
echo ========================================
echo.
echo 正在启动安装程序...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '.\install-git.ps1'"

echo.
pause

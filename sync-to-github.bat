@echo off
chcp 65001 >nul
echo ========================================
echo   自动同步代码到 GitHub
echo ========================================
echo.
echo 正在启动 PowerShell 脚本...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '.\sync-to-github.ps1'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ 同步成功！
) else (
    echo.
    echo ✗ 同步失败，请检查错误信息
)

echo.
pause

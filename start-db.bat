@echo off
chcp 65001 >nul

echo ========================================
echo   数据库管理系统启动脚本
echo ========================================
echo.

:: 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装

:: 检查 package.json 文件
if not exist "package.json" (
    echo ❌ package.json 文件不存在
    pause
    exit /b 1
)

:: 检查 node_modules 目录
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
)

:: 检查数据库目录
if not exist "database" (
    echo ❌ 数据库目录不存在
    pause
    exit /b 1
)

:: 安装 uuid 依赖（用于生成唯一ID）
echo 📦 安装 uuid 依赖...
npm install uuid
if %errorlevel% neq 0 (
    echo ❌ uuid 依赖安装失败
    pause
    exit /b 1
)
echo ✅ uuid 依赖安装完成

echo.
echo 🚀 启动数据库管理系统...
echo.

:: 启动数据库管理界面
node database/manager.js

pause

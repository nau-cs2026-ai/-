#!/bin/bash

# 数据库管理系统启动脚本

echo "========================================"
echo "  数据库管理系统启动脚本"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 已安装"

# 检查依赖
if [ ! -f "package.json" ]; then
    echo "❌ package.json 文件不存在"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

# 检查数据库目录
if [ ! -d "database" ]; then
    echo "❌ 数据库目录不存在"
    exit 1
fi

# 安装 uuid 依赖（用于生成唯一ID）
echo "📦 安装 uuid 依赖..."
npm install uuid
if [ $? -ne 0 ]; then
    echo "❌ uuid 依赖安装失败"
    exit 1
fi
echo "✅ uuid 依赖安装完成"

echo ""
echo "🚀 启动数据库管理系统..."
echo ""

# 启动数据库管理界面
node database/manager.js

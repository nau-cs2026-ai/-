# 自动同步代码到 GitHub 的脚本
# 使用前请确保已安装 Git 并配置了 GitHub 认证

param(
    [string]$CommitMessage = "完善系统功能并修复问题",
    [string]$Branch = "main"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  自动同步代码到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否安装
Write-Host "检查 Git 安装状态..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git 未安装，请先安装 Git" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 检查是否已初始化 Git 仓库
Write-Host "`n检查 Git 仓库状态..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git 仓库已初始化" -ForegroundColor Green
}

# 检查是否有远程仓库
Write-Host "`n检查远程仓库配置..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "请输入 GitHub 仓库地址 (例如: https://github.com/username/repository.git):" -ForegroundColor Yellow
    $repoUrl = Read-Host
    git remote add origin $repoUrl
    Write-Host "✓ 远程仓库已配置" -ForegroundColor Green
} else {
    Write-Host "✓ 远程仓库已配置: $remoteUrl" -ForegroundColor Green
}

# 添加所有修改
Write-Host "`n添加修改文件..." -ForegroundColor Yellow
git add .
Write-Host "✓ 文件已添加到暂存区" -ForegroundColor Green

# 查看状态
Write-Host "`n当前修改状态:" -ForegroundColor Yellow
git status

# 提交修改
Write-Host "`n提交修改..." -ForegroundColor Yellow
git commit -m $CommitMessage
Write-Host "✓ 修改已提交" -ForegroundColor Green

# 推送到 GitHub
Write-Host "`n推送到 GitHub..." -ForegroundColor Yellow
try {
    git push -u origin $Branch
    Write-Host "✓ 代码已成功推送到 GitHub!" -ForegroundColor Green
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  同步完成!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} catch {
    Write-Host "✗ 推送失败，可能需要先拉取远程代码" -ForegroundColor Red
    Write-Host "尝试拉取并合并..." -ForegroundColor Yellow
    git pull origin $Branch --allow-unrelated-histories
    git push -u origin $Branch
    Write-Host "✓ 代码已成功推送到 GitHub!" -ForegroundColor Green
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

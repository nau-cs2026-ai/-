# 自动下载和安装 Git

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  自动安装 Git for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否已经安装 Git
Write-Host "检查 Git 安装状态..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
        Write-Host "`n无需重复安装。" -ForegroundColor Green
        Write-Host "`n按任意键退出..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
} catch {
    Write-Host "✗ Git 未安装，开始下载..." -ForegroundColor Yellow
}

# Git 下载链接
$gitDownloadUrl = "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe"
$installerPath = "$env:TEMP\Git-2.44.0-64-bit.exe"

# 下载 Git 安装程序
Write-Host "`n正在下载 Git 安装程序..." -ForegroundColor Yellow
Write-Host "下载地址: $gitDownloadUrl" -ForegroundColor Gray

try {
    # 使用 .NET WebClient 下载
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($gitDownloadUrl, $installerPath)
    Write-Host "✓ 下载完成: $installerPath" -ForegroundColor Green
} catch {
    Write-Host "✗ 下载失败: $_" -ForegroundColor Red
    Write-Host "`n请手动下载 Git:" -ForegroundColor Yellow
    Write-Host "https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "`n按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# 运行安装程序
Write-Host "`n正在启动 Git 安装程序..." -ForegroundColor Yellow
Write-Host "请在安装向导中按照默认设置完成安装。" -ForegroundColor Yellow
Write-Host ""

try {
    $process = Start-Process -FilePath $installerPath -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "`n✓ Git 安装程序已成功运行" -ForegroundColor Green
        
        # 清理安装文件
        Remove-Item -Path $installerPath -Force
        Write-Host "✓ 已清理安装文件" -ForegroundColor Green
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  安装完成!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "`n请重启命令行窗口以使 Git 生效。" -ForegroundColor Yellow
        Write-Host "然后运行 'git --version' 验证安装。" -ForegroundColor Yellow
    } else {
        Write-Host "`n✗ 安装程序返回错误代码: $($process.ExitCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n✗ 运行安装程序失败: $_" -ForegroundColor Red
    Write-Host "请手动运行安装程序: $installerPath" -ForegroundColor Yellow
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

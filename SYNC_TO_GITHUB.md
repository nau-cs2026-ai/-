# 自动同步代码到 GitHub 指南

## 📋 准备工作

### 1. 安装 Git（如果还没有安装）

**下载地址：** https://git-scm.com/download/win

**安装步骤：**
1. 下载 Git for Windows 安装程序
2. 运行安装程序，按照提示完成安装
3. 安装完成后重启命令行窗口

### 2. 配置 Git 用户信息

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

### 3. 配置 GitHub 认证

**方法一：使用 HTTPS + Personal Access Token**
1. 在 GitHub 创建 Personal Access Token
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：repo, workflow
   - 生成并保存 token
2. 在推送时使用 token 作为密码

**方法二：使用 SSH 密钥**
1. 生成 SSH 密钥：
   ```bash
   ssh-keygen -t ed25519 -C "你的邮箱"
   ```
2. 添加到 GitHub：
   - 复制 `~/.ssh/id_ed25519.pub` 内容
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key" 并粘贴

## 🚀 使用自动同步脚本

### 方法一：右键运行

1. 找到项目目录中的 `sync-to-github.ps1` 文件
2. 右键点击文件
3. 选择 "使用 PowerShell 运行"

### 方法二：命令行运行

```powershell
# 进入项目目录
cd d:\product-main

# 运行脚本
.\sync-to-github.ps1
```

### 方法三：自定义提交信息

```powershell
.\sync-to-github.ps1 -CommitMessage "你的提交信息"
```

## 📝 手动同步步骤

如果自动脚本无法运行，可以手动执行以下命令：

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 3. 添加所有修改
git add .

# 4. 提交修改
git commit -m "完善系统功能并修复问题"

# 5. 推送到 GitHub
git push -u origin main
```

## 🔧 常见问题

### 问题 1：推送失败，提示需要拉取

**解决方案：**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题 2：认证失败

**解决方案：**
- 确保使用正确的 GitHub 用户名和密码/token
- 如果使用 HTTPS，确保 token 有正确的权限
- 如果使用 SSH，确保密钥已正确添加到 GitHub

### 问题 3：脚本无法运行

**解决方案：**
1. 以管理员身份运行 PowerShell
2. 修改执行策略：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. 重新运行脚本

## ✅ 本次修改内容

### 后端修改
- `backend/routes/products.ts` - 修复商品发布状态（pending → approved）
- `backend/data/users.json` - 用户数据更新

### 前端修改
- `frontend/src/pages/Index.tsx` - 主要功能完善
  - ✅ 图片上传功能优化（URL、文件选择、拖拽）
  - ✅ 分类浏览功能（筛选、排序）
  - ✅ 商品详情页
  - ✅ 私信系统
  - ✅ 个人中心
  - ✅ 修复图标导入问题

### 功能完善
- ✅ 用户注册和登录
- ✅ 商品发布和管理
- ✅ 分类浏览和搜索
- ✅ 商品详情查看
- ✅ 私信沟通
- ✅ 个人中心管理

## 📞 需要帮助？

如果遇到问题，请检查：
1. Git 是否正确安装
2. GitHub 认证是否配置正确
3. 网络连接是否正常
4. 仓库地址是否正确

---

**创建时间：** 2026-03-30
**最后更新：** 2026-03-30

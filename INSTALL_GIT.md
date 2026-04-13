# 📦 Git 安装指南

## 🚀 自动安装（推荐）

### 方法一：双击运行安装脚本

1. **找到安装脚本**
   - 在项目目录中找到 `install-git.bat` 文件

2. **右键以管理员身份运行**
   - 右键点击 `install-git.bat`
   - 选择"以管理员身份运行"

3. **等待安装完成**
   - 脚本会自动下载 Git 安装程序
   - 在安装向导中使用默认设置
   - 点击"Next"直到安装完成

4. **验证安装**
   - 重启命令行窗口
   - 运行命令：`git --version`
   - 如果显示版本号，说明安装成功

### 方法二：手动下载安装

如果自动安装失败，请手动安装：

1. **下载 Git**
   - 访问：https://git-scm.com/download/win
   - 点击下载最新版本

2. **运行安装程序**
   - 双击下载的 `.exe` 文件
   - 使用默认设置
   - 点击"Next"直到完成

3. **验证安装**
   - 重启命令行窗口
   - 运行：`git --version`

## ⚙️ 安装后配置

### 1. 配置用户信息

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

### 2. 配置 GitHub 认证

#### 方法一：HTTPS + Personal Access Token

1. **创建 GitHub Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`, `workflow`
   - 点击 "Generate token"
   - **重要：** 复制并保存 token（只显示一次）

2. **使用 Token 认证**
   - 推送代码时，用户名输入 GitHub 用户名
   - 密码输入刚才保存的 token

#### 方法二：SSH 密钥（推荐）

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "你的邮箱"
   # 按 Enter 使用默认路径
   # 可以设置密码或留空
   ```

2. **添加到 GitHub**
   - 复制公钥内容：
     ```bash
     cat ~/.ssh/id_ed25519.pub
     # Windows: type %USERPROFILE%\.ssh\id_ed25519.pub
     ```
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥内容
   - 点击 "Add SSH key"

3. **测试连接**
   ```bash
   ssh -T git@github.com
   ```

## ✅ 验证安装

运行以下命令验证安装：

```bash
# 检查 Git 版本
git --version

# 检查用户配置
git config --global user.name
git config --global user.email

# 测试 GitHub 连接（SSH 方式）
ssh -T git@github.com
```

## 🔧 常见问题

### 问题 1：命令行找不到 git

**解决方案：**
- 重启命令行窗口
- 检查环境变量是否包含 Git 路径
- 默认路径：`C:\Program Files\Git\bin`

### 问题 2：推送时认证失败

**解决方案：**
- 确保使用正确的用户名和 token
- 如果使用 SSH，确保密钥已添加到 GitHub
- 检查网络连接

### 问题 3：安装程序无法运行

**解决方案：**
- 以管理员身份运行
- 检查杀毒软件是否阻止
- 手动下载安装

## 📝 下一步

安装完成后，你可以：

1. **运行同步脚本**
   ```bash
   .\sync-to-github.bat
   ```

2. **手动同步代码**
   ```bash
   git init
   git add .
   git commit -m "完善系统功能"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

## 📞 需要帮助？

如果遇到问题：
1. 检查 Git 是否正确安装
2. 检查环境变量配置
3. 检查网络连接
4. 查看 Git 官方文档：https://git-scm.com/doc

---

**创建时间：** 2026-03-30
**Git 版本：** 2.44.0

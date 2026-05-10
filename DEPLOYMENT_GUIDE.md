# 张小账 APP 部署指南

## 方案一：通过 GitHub + Vercel Web 部署（推荐）

### 第一步：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录您的账号
2. 点击右上角的 **"+"** 按钮，选择 **"New repository"**
3. 填写仓库信息：
   - Repository name: `zhangxiao-app`
   - Description: `张小账 - 智能语音记账APP`
   - 选择 **Public**（公开）或 **Private**（私有）
   - ✅ 勾选 "Add a README file"
4. 点击 **"Create repository"**

### 第二步：上传代码到 GitHub

在终端中执行以下命令（如果您已经打开Git Bash或终端）：

```bash
# 进入项目目录
cd /workspace/voice-ledger

# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "张小账APP - 智能语音记账应用"

# 添加远程仓库（将 YOUR_USERNAME 替换为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/zhangxiao-app.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

### 第三步：连接 Vercel 并部署

1. 访问 [Vercel](https://vercel.com) 并使用 GitHub 账号登录
2. 点击 **"Add New..."** 按钮，选择 **"Project"**
3. 在 "Import Git Repository" 页面，找到您刚创建的 `zhangxiao-app` 仓库
4. 点击 **"Import"** 按钮
5. 配置项目设置：
   - Framework Preset: **Vite**（应该会自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 **"Deploy"** 按钮
7. 等待部署完成（通常1-3分钟）
8. 部署成功后，您将获得一个 URL，例如：`https://zhangxiao-app.vercel.app`

### 🎉 完成！

现在您可以通过该 URL 访问您的 APP，并且每次推送代码到 GitHub 后，Vercel 会自动重新部署。

---

## 方案二：手动部署 dist 文件夹

如果您只想部署已构建的文件：

1. 将 `/workspace/voice-ledger/dist/` 文件夹下载到本地
2. 访问 [Vercel](https://vercel.com) 并登录
3. 点击 **"Add New..."** 按钮，选择 **"Project"**
4. 选择 **"Import Third-Party Git Repository"** 下方的 **"Or drop a folder here"**
5. 将 `dist` 文件夹拖拽到上传区域
6. 等待处理完成即可获得 URL

---

## 重要提示

### 管理员账号
- **账号**: `2729143515`
- **密码**: `ZL4505124TTZL`

### 数据存储
当前 APP 使用 localStorage 存储数据，这意味着：
- ✅ 数据保存在用户浏览器本地
- ⚠️ 换设备后数据不会同步
- 💡 如果需要真正的云端数据同步，需要添加后端数据库

### 下一步优化建议

如果您希望完善 APP，可以考虑：

1. **添加云端数据库**
   - 使用 Firebase、Supabase 或 MongoDB Atlas
   - 实现多设备数据同步

2. **添加用户管理后台**
   - 更完善的用户管理
   - 管理员可以查看所有用户数据

3. **添加微信/支付宝支付**
   - 集成真实的支付功能
   - 实现订阅收费

---

## 遇到问题？

如果部署过程中遇到问题：
1. 检查 GitHub 仓库是否设置为 Public
2. 确认 Vercel 连接的是正确的 GitHub 账号
3. 查看 Vercel 部署日志中的错误信息
4. 确保 package.json 中的 build 命令正确

---

**版本**: 1.0.0
**最后更新**: 2026-05-10

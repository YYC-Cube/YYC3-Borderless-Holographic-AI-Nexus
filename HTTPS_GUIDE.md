# YYC³ Cloud Sync 指南

由于浏览器的安全限制，**HTTPS 网页无法直接访问 HTTP 服务器**。这被称为 "Mixed Content" 错误。
为了让您的 YYC³ 应用（运行在 HTTPS 上）连接到您的本地/NAS PostgreSQL 服务器（运行在 HTTP 上），您需要将 HTTP 服务“隧道”到 HTTPS。

我们推荐使用 **ngrok**，它是一个免费且简单的工具。

## 步骤 1: 安装 Ngrok

访问 [ngrok.com](https://ngrok.com/download) 下载并安装对应版本的 ngrok。

## 步骤 2: 启动隧道

假设您的 Postgres 中间件服务运行在本地端口 `7007` (或者您的 NAS IP)，在终端中运行：

```bash
# 如果服务在本地
ngrok http 7007

# 或者如果服务在 NAS IP (例如 8.152.195.33)
ngrok http 8.152.195.33:7007
```

## 步骤 3: 获取 HTTPS 地址

Ngrok 启动后会显示一个 Forwarding 地址，例如：
`https://a1b2-c3d4.ngrok-free.app`

## 步骤 4: 更新 YYC³ 配置

1. 打开 YYC³ 设置面板。
2. 进入 **“云端 (Cloud)”** 标签页。
3. 将 **服务器地址** 更新为 Ngrok 提供的 HTTPS 地址。
4. 点击保存。

现在同步功能应该可以正常工作了！

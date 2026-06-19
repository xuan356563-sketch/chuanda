# GearMind

智能装备助手原型：根据比赛/训练场景、天气、地点、已有装备库和强制装备要求，生成穿搭、携带清单和购买缺口。

## 本地运行

```bash
npm start
```

默认地址：

```text
http://127.0.0.1:4173
```

## API

- `GET /api/race-search?q=比赛名或线路`
- `GET /api/weather?location=地点&eventTime=比赛时间`
- `GET /api/mandatory-gear?q=比赛名&detail=细分项目&distance=距离`
- `POST /api/assistant-task`
- `GET /healthz`

## MiniMax M3 开发助手

M3 只作为开发阶段的子任务助手，不出现在 GearMind 产品页面里。它适合生成候选规则、装备卡文案和强制装备审核草稿。真实 API Key 不要提交到 Git。

本地配置：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```env
MINIMAX_API_KEY=your_minimax_key_here
MINIMAX_MODEL=MiniMax-M3
MINIMAX_API_BASE_URL=https://api.minimax.io/v1/responses
ENABLE_DEV_ASSISTANT=true
```

如果 MiniMax 官方 endpoint 和默认值不同，只需要改 `MINIMAX_API_BASE_URL`。`/api/assistant-task` 默认关闭，只有 `ENABLE_DEV_ASSISTANT=true` 时才可用。

## 部署

项目已经包含常见 Node Web 服务部署配置：

- `render.yaml`：Render Blueprint
- `railway.json`：Railway Nixpacks
- `Procfile`：通用 Node 平台入口

启动命令：

```bash
npm start
```

云平台需要把服务端口通过 `PORT` 环境变量传入，`server.js` 会自动监听 `0.0.0.0:$PORT`。

### Render 部署步骤

1. 打开 Render Dashboard，选择 New -> Blueprint。
2. 连接 GitHub 仓库：`https://github.com/xuan356563-sketch/chuanda`。
3. Render 会读取仓库里的 `render.yaml`，创建一个 Node Web Service。
4. 在服务的 Environment 里添加：

```env
MINIMAX_API_KEY=你的 MiniMax API Key
MINIMAX_MODEL=MiniMax-M3
MINIMAX_API_BASE_URL=https://api.minimax.io/v1/responses
ENABLE_DEV_ASSISTANT=false
```

5. 部署完成后访问 Render 分配的 `https://*.onrender.com` 地址。

注意：`.env` 只用于本地开发，不要提交到 GitHub。云端必须在平台后台配置环境变量。

### Railway 部署步骤

1. 打开 Railway，选择 Deploy from GitHub repo。
2. 选择 `xuan356563-sketch/chuanda`。
3. Railway 会读取 `railway.json` 并执行 `npm start`。
4. 在 Variables 中添加与 Render 相同的 MiniMax 环境变量。
5. 生成 Public Domain 后，用公网地址访问。

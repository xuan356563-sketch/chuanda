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

## MiniMax M3 子任务助手

M3 用于生成候选规则、装备卡文案和强制装备审核。真实 API Key 不要提交到 Git。

本地配置：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```env
MINIMAX_API_KEY=your_minimax_key_here
MINIMAX_MODEL=MiniMax-M3
MINIMAX_API_BASE_URL=https://api.minimax.chat/v1/chat/completions
```

如果 MiniMax 官方 endpoint 和默认值不同，只需要改 `MINIMAX_API_BASE_URL`。

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

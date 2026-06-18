# MiniMax M3 子任务助手

GearMind 里 MiniMax M3 的定位是“候选内容生成器”，适合处理边界清楚的小任务，主流程再审核和组装。

## 支持任务

- `rules`：根据当前场景生成搭配规则候选。
- `gear-card-copy`：生成游戏装备卡片文案候选。
- `mandatory-gear-review`：审核强制装备、补给和缺口。

## 本地配置

复制 `.env.example` 为 `.env`，填入自己的 key：

```env
MINIMAX_API_KEY=your_minimax_key_here
MINIMAX_MODEL=MiniMax-M3
MINIMAX_API_BASE_URL=https://api.minimax.chat/v1/chat/completions
```

`.env` 已经被 `.gitignore` 忽略，不会进入 Git 提交。

## 服务端接口

```http
POST /api/assistant-task
Content-Type: application/json
```

```json
{
  "taskType": "rules",
  "payload": {
    "scene": {},
    "gear": [],
    "mandatoryGear": null
  }
}
```

如果 MiniMax 的正式 endpoint 和默认值不同，只需要修改 `MINIMAX_API_BASE_URL`。

# MiniMax M3 子任务助手

GearMind 里 MiniMax M3 的定位是开发阶段的“候选内容生成器”，适合处理边界清楚的小任务，主流程再审核和组装。它不应该出现在用户可见的产品页面里。

## 支持任务

- `rules`：根据当前场景生成搭配规则候选。
- `gear-card-copy`：生成游戏装备卡片文案候选。
- `mandatory-gear-review`：审核强制装备、补给和缺口。

## 本地配置

复制 `.env.example` 为 `.env`，填入自己的 key：

```env
MINIMAX_API_KEY=your_minimax_key_here
MINIMAX_MODEL=MiniMax-M3
MINIMAX_API_BASE_URL=https://api.minimax.io/v1/responses
ENABLE_DEV_ASSISTANT=true
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

`/api/assistant-task` 默认关闭，只有 `ENABLE_DEV_ASSISTANT=true` 时才会启用。默认使用 MiniMax OpenAI Responses API。若你使用国内 Token Plan，可把 `MINIMAX_API_BASE_URL` 改为 `https://api.minimaxi.com/anthropic/v1/messages`。

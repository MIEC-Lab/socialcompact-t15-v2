# V2 真实 Agent 公网部署说明

## 目标

这个版本的目标是：

用户打开 Vercel 前端网页后，不需要输入本地端口，也不需要启动你电脑上的后端，就可以直接开始真实 Agent 版 Survivor Game。

## 需要部署哪些服务

真实 Agent 网页端可玩不是只部署一个后端，而是至少需要 4 个公网服务：

```text
Vercel frontend
        |
        v
Render web-backend
        |
        v
Render Arena
        |
        v
Render Agent 1 + Render Agent 2
        |
        v
OpenRouter / OpenAI / Google 等 LLM API
```

也就是说：

- `frontend` 仍然部署在 Vercel。
- `web-backend` 部署在 Render，负责接收网页请求。
- `agentbeats/Arena` 部署在 Render，负责组织游戏。
- `agentbeats/Agent` 部署两份在 Render，代表两个 AI 玩家。
- 两个 Agent 都需要配置 `API_KEY`，否则不能真实调用大模型。

## 本仓库已经做好的准备

本仓库已经加入：

- `render.yaml`：Render Blueprint 配置，会创建 `web-backend`、`Arena`、`Agent 1`、`Agent 2` 四个服务。
- Agent / Arena 服务会自动读取云平台的 `$PORT`。
- 后端支持读取 `SOCIALCOMPACT_ARENA_URL`、`SOCIALCOMPACT_PLAYER_URL_1`、`SOCIALCOMPACT_PLAYER_URL_2`。
- 前端支持默认开启真实 Arena 模式。

## 第一步：把当前分支合并到个人仓库 main

如果你确认要进入真实 Agent 公网版开发，先把 `codex/v2-public-backend` 合并到个人仓库 `main`。

不要直接推到 MIEC 老师仓库，除非组长确认要提交阶段成果。

## 第二步：在 Render 创建 Blueprint

1. 打开 Render。
2. 点击 New。
3. 选择 Blueprint。
4. 连接 GitHub。
5. 选择个人仓库：

```text
makabaka99163/SocialCOMPACT-web
```

6. Render 会读取根目录的 `render.yaml`。
7. 它会准备创建 4 个服务：

```text
socialcompact-web-backend
socialcompact-arena
socialcompact-agent-1
socialcompact-agent-2
```

8. 创建前，Render 会要求填写两个 Agent 的 `API_KEY`。

## 第三步：配置 Agent 环境变量

默认配置是：

```text
PLATFORM=OPENROUTER
MODEL=openai/gpt-oss-120b:free
API_KEY=你的 OpenRouter API key
```

如果要用 OpenAI，可以改成：

```text
PLATFORM=OPENAI
MODEL=gpt-4.1-mini
API_KEY=你的 OpenAI API key
```

注意：

- 不要把真实 API key 写进代码。
- 只在 Render 的 Environment Variables 里填写 API key。
- 两个 Agent 服务都要填 API key。

## 第四步：等待 4 个服务部署成功

部署完成后，分别打开这些健康检查地址：

```text
https://你的-web-backend地址/api/health
https://你的-arena地址/.well-known/agent-card.json
https://你的-agent-1地址/.well-known/agent-card.json
https://你的-agent-2地址/.well-known/agent-card.json
```

如果都能打开，说明 4 个服务都在线。

## 第五步：设置 Vercel 前端环境变量

打开 Vercel 项目 `social-compact-web`，进入：

```text
Settings -> Environment Variables
```

添加或更新：

```text
NEXT_PUBLIC_API_BASE_URL=https://你的-web-backend地址
NEXT_PUBLIC_DEFAULT_USE_ARENA=true
NEXT_PUBLIC_DEFAULT_AGENT_URLS=
```

保存后，进入 Deployments，点击最新部署右侧三个点，选择 Redeploy。

## 第六步：网页端验收

打开 Vercel 网页：

```text
https://social-compact-web.vercel.app
```

验收标准：

- Start 页面 Backend URL 默认是 Render 后端地址。
- `Use Arena when available` 默认勾选。
- Player Agent URLs 可以为空。
- 点击 Start Match。
- 页面进入 Results。
- Results 页面显示 `source=arena` 或 Arena 相关日志。
- Live Game Process 中能看到 Agent 的 chat / prediction / decision / observation。

## 成本和稳定性提醒

真实 Agent 版会消耗 API token。

推荐测试参数：

```text
Player Count: 2
Max Rounds: 1 或 2
```

如果用免费 Render 服务，可能会遇到：

- 服务冷启动比较慢。
- 第一次点击可能等待较久。
- 多个服务同时休眠后，需要先访问健康检查地址唤醒。
- 免费模型可能限流，导致比赛失败或变慢。

如果演示当天需要稳定，建议提前 5 分钟打开 4 个服务的健康检查地址，让它们保持在线。

## 当前 V2 和 V1 的区别

V1：

- 前端在 Vercel。
- 后端主要本地运行。
- 真实 Agent 游戏需要本地启动多个终端。

V2：

- 前端在 Vercel。
- 后端、Arena、两个 Agent 都在 Render。
- 用户打开网页可以直接启动真实 Agent Survivor Game。

## 如果真实 Agent 失败怎么办

如果真实 Agent 服务不可用，后端目前会 fallback 到 local simulation。

这保证网页不会完全坏掉，但如果你要证明是真实 Agent，请看：

- Results 页面 `source` 是否是 `arena`。
- Live Game Process 是否有真实 `chat`、`prediction`、`decision`。
- Render Agent 日志里是否出现 LLM 调用输出。

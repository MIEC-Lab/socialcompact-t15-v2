# V2 公网后端部署说明

## V2 目标

V2 的目标是让别人打开 Vercel 前端网页后，不需要输入你电脑上的本地端口，也能直接点击按钮开始 Survivor Game。

如果只想先让网页公网可玩，可以使用本文件的 simulation 版本。

如果目标是“真实 Agent 网页端可玩”，请看：

```text
docs/V2_REAL_AGENT_PUBLIC_DEPLOYMENT.md
```

本文件的推荐范围是：

- 前端仍然部署在 Vercel。
- `web-backend` 部署成一个公网 FastAPI 服务。
- Vercel 前端默认连接这个公网后端。
- 默认游戏模式使用后端内置的 Survivor simulation，因此任何访问者都能直接玩。
- 真实 Arena / Agent 模式仍然保留，但需要后续额外部署 Arena 和 Agent 服务。

## 重要区别

### 公网可玩版本

这是 V2 推荐先完成的版本。用户只需要打开网页，点击 Start Match，就能看到 Survivor Game 的结果和过程日志。

这个版本不需要用户本地运行后端，也不需要用户输入 `127.0.0.1:8000`。

### 真实 AI Agent 公网版本

这个版本需要同时部署：

- `web-backend`
- `agentbeats/Arena`
- 至少两个 `agentbeats/Agent`

还需要在部署平台配置 API key。这个版本更接近最终理想形态，但部署难度和 API token 成本都更高，建议作为 V3 或最终优化。

## 后端部署到 Render

Render 官方 FastAPI 部署方式需要：

- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

本项目已经在仓库根目录加入 `render.yaml`，也在 `web-backend` 中加入了 `Procfile` 和 `runtime.txt`，方便部署平台识别。

### 方法 A：使用 Render Blueprint

1. 打开 Render。
2. 选择 New。
3. 选择 Blueprint。
4. 连接 GitHub 仓库。
5. 选择你的个人仓库 `makabaka99163/SocialCOMPACT-web`。
6. Render 会读取根目录的 `render.yaml`。
7. 创建服务。
8. 等待部署完成。
9. 得到类似下面的公网后端地址：

```text
https://socialcompact-web-backend.onrender.com
```

### 方法 B：手动创建 Web Service

如果不用 Blueprint，就手动填写：

```text
Root Directory:
web-backend

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Health Check Path:
/api/health
```

部署完成后，打开：

```text
https://你的后端地址/api/health
```

如果看到类似下面的内容，说明后端部署成功：

```json
{
  "status": "ok",
  "service": "web-backend",
  "version": "1.0.0"
}
```

## Vercel 前端连接公网后端

后端部署成功后，需要在 Vercel 中设置环境变量：

```text
NEXT_PUBLIC_API_BASE_URL=https://你的后端地址
```

操作步骤：

1. 打开 Vercel Dashboard。
2. 进入 `social-compact-web` 项目。
3. 点击 Settings。
4. 点击 Environment Variables。
5. 新建变量：

```text
Name:
NEXT_PUBLIC_API_BASE_URL

Value:
https://你的后端地址
```

6. Environment 选择 Production。
7. 保存。
8. 回到 Deployments。
9. 点击最新部署右侧三个点。
10. 点击 Redeploy。

重新部署完成后，打开 Vercel 页面，Start 页面里的 Backend URL 默认就会变成公网后端地址。

## 验收标准

V2 通过验收需要满足：

- 打开 Vercel 首页正常。
- 点击 Start Match 正常进入开始页。
- Backend URL 默认是公网后端，不是 `127.0.0.1:8000`。
- 不启动本地后端也能点击 Start Match。
- 页面跳转到 Results。
- Results 能看到 winner、players、round logs。
- `/api/health` 在浏览器里能打开。

## 当前限制

这个 V2 公网版本默认是后端 simulation，不是完整真实 Agent 推理。

如果要让网页上的每一局都是真实 AI Agent 和 Arena 对战，需要后续继续部署 Arena 和 Agent，并在后端配置：

```text
SOCIALCOMPACT_ARENA_URL=https://你的-arena-公网地址
SOCIALCOMPACT_PLAYER_URLS=https://agent-1-公网地址,https://agent-2-公网地址
SOCIALCOMPACT_USE_ARENA=true
```

这一步建议放到 V3。

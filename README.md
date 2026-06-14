# xueyifang-frontend-cloud

学艺坊 Spring Cloud 重构版前端，基于 Vue 3、TypeScript、Vite、Element Plus、Pinia 和 Vue Router。

## 后端接入

- 浏览器端 API 统一请求同源 `/api/**`。
- 本地开发由 Vite 代理到新后端 Gateway，默认目标为 `http://43.213.28.91:18080`。
- 生产部署由 Nginx 托管静态资源，并把 `/api/**`、`/backend/api/**`、`/api/ws` 反代到 Gateway。
- 登录和注册页面仍展示“学号/姓名”，`src/api/auth.ts` 会适配新后端需要的 `username`、`nickname` 字段。

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

如需切换代理后端：

```bash
cp .env.example .env.local
```

然后修改 `.env.local`：

```dotenv
VITE_API_PROXY_TARGET=http://43.213.28.91:18080
```

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 部署约定

正式部署不要在服务器直接修改源码。流程应为：

1. 本地修改并构建验证。
2. 提交并推送到 GitHub。
3. 服务器从 GitHub 拉取最新代码。
4. 服务器执行 `npm ci && npm run build`。
5. 将 `dist/` 同步到 Nginx 静态目录。

## 常用路径

| 路径 | 说明 |
| --- | --- |
| `src/api/request.ts` | Axios 统一封装，默认 `baseURL` 为 `/api`。 |
| `src/api/auth.ts` | 登录、注册、当前用户等认证接口，包含新旧字段适配。 |
| `src/router/index.ts` | 路由和权限守卫。 |
| `src/stores/app.ts` | Token 状态和 localStorage 持久化。 |
| `src/stores/user.ts` | 当前用户信息和退出登录。 |
| `vite.config.ts` | 本地开发代理配置。 |

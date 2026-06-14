# PROJECT_MEMORY

## 记忆规约

- 本文件只记录项目索引、路径、功能短评和 Todo。
- 不写具体业务代码。
- 重要进度变化后同步更新本文件。
- 服务器部署以 GitHub 仓库为源码来源，不直接在服务器手改前端源码。

## 项目概况

- 项目名称：`xueyifang-frontend-cloud`
- 项目目标：将旧 `xueyifang-frontend` 接入新的 `xueyifang-cloud` Spring Cloud 后端。
- 本地路径：`D:\_Code\Java\xueyifang-frontend-cloud`
- 后端 Gateway：`http://43.213.28.91:18080`
- 生产域名：`https://xueyifang.luoyiy.eu.cc/`
- 当前状态：已从旧前端参考目录复制出独立前端仓库；已在本地适配新后端登录/注册字段、当前用户响应、Vite 代理和 WebSocket 同源路径；已升级 `vue-tsc` 并修复旧类型问题，`npm run build` 已通过。

## 根目录索引

| 路径 | 类型 | 功能短评 |
| --- | --- | --- |
| `README.md` | 文档 | 云端前端开发、构建和部署说明。 |
| `PROJECT_MEMORY.md` | 文档 | 项目索引、状态和 Todo。 |
| `.env.example` | 配置 | 本地 Vite 代理目标示例。 |
| `.gitignore` | 配置 | 忽略依赖、构建产物和本地环境文件。 |
| `package.json` | 配置 | npm 脚本和依赖。 |
| `package-lock.json` | 配置 | npm 锁定依赖版本。 |
| `vite.config.ts` | 配置 | Vite、Vue 插件、Element Plus 自动导入和本地代理。 |
| `src/` | 目录 | 前端源码。 |
| `prototypes/` | 目录 | 原型静态页面。 |

## 关键源码索引

| 路径 | 功能短评 |
| --- | --- |
| `src/api/request.ts` | Axios 统一封装，浏览器端默认请求同源 `/api`。 |
| `src/api/auth.ts` | 认证接口；将旧前端 `studentId`/`realName` 适配为新后端 `username`/`nickname`，并归一化登录和当前用户响应。 |
| `src/composables/useWebSocket.ts` | WebSocket 连接；开发和生产统一走同源 `/api/ws`。 |
| `src/router/index.ts` | 路由和登录、管理员、发布权限守卫。 |
| `src/stores/app.ts` | Token 和全局 loading 状态。 |
| `src/stores/user.ts` | 当前用户信息、拉取当前用户和退出登录。 |
| `src/types/auth.ts` | 登录、注册、用户和登录响应类型。 |
| `src/types/service.ts` | 服务市场相关类型。 |
| `src/types/order.ts` | 订单、支付、退款相关类型和状态辅助函数。 |
| `src/views/auth/Login.vue` | 用户登录页。 |
| `src/views/auth/Register.vue` | 用户注册页。 |
| `src/views/admin/login/AdminLogin.vue` | 管理员登录页。 |

## 部署约定

- GitHub 仓库名计划为 `2832599985/xueyifang-frontend-cloud`。
- 服务器应从 GitHub 拉取代码后执行 `npm ci && npm run build`。
- 构建产物同步到 `/var/www/xueyifang.luoyiy.eu.cc`。
- Nginx 同源 `/api/**` 去掉 `/api` 前缀转发到 `127.0.0.1:18080` Gateway；`/backend/api/**` 兼容旧上传路径；`/api/ws` 转发 WebSocket。

## Todo

- 创建 GitHub 新仓库并推送本地前端代码。
- 在服务器从 GitHub 拉取新前端仓库，执行构建并发布。
- 用生产域名验证登录、注册、当前用户和核心页面请求。
- 后续按业务流程继续冒烟服务浏览、发布、下单、退款/纠纷、统计、用户导入、通知和文件上传。

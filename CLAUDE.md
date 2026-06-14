# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

学艺坊 (Xueyifang) 前端 - 校园技能服务与交易平台，基于 Vue 3 + TypeScript + Vite + Element Plus。

## Build & Run Commands

```bash
# 安装依赖
npm install

# 开发服务器 (端口 3000, 监听 0.0.0.0 允许局域网访问)
npm run dev

# 生产构建 (先执行 vue-tsc --noEmit 类型检查，TS 错误会导致构建失败)
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## Architecture

### Technology Stack
- Vue 3.3.4, TypeScript 5.2.2, Vite 4.4.9
- Element Plus 2.3.14 (自动按需导入), @element-plus/icons-vue
- Vue Router 4.2.4, Pinia 2.1.6, Axios 1.5.0
- ECharts 5.4.3 (统计图表), vue3-eventbus (组件间事件通信)

### Key Patterns

**API 请求**:
- 统一封装在 `src/api/request.ts`，baseURL=`/api`
- Token 自动从 localStorage 添加到请求头
- 响应拦截器处理业务错误码 (code !== 0 自动弹出错误提示)
- 成功响应直接返回 data (不含 code/message 包装)

**路由守卫**:
- `requiresAuth: true` - 需要登录
- `requiresAdmin: true` - 需要管理员权限 (role = 2)
- `requiresPublishPermission: true` - 需要发布权限
- 未登录访问认证页面自动跳转 `/login`
- 管理员登录后访问 `/` 自动跳转 `/admin/dashboard`

**状态管理** (6个 Pinia Store):
- `useUserStore` - 用户信息 (`userInfo`, `isLoggedIn`)
- `useAppStore` - Token 管理 (`setToken`, `clearToken`)
- `useChatStore` - 聊天状态
- `useDictStore` - 字典数据缓存（服务标签、专业列表、交易地点）
- `useNotificationStore` - 通知状态
- `useRegisterConfigStore` - 注册页面配置（注册开关状态）

**Element Plus 自动导入**:
- 无需手动 import 组件
- `auto-imports.d.ts` 和 `components.d.ts` 自动生成 (已加入 .gitignore)

### API Proxy

开发环境代理配置 (vite.config.ts):
- `/api/*` → `http://localhost:8080/api/*`
- `/backend/*` → `http://localhost:8080/*`

路径别名: `@` → `./src`

## Page Routes

| 路径 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/login`, `/register` | 登录/注册 | 公开 |
| `/services`, `/services/:id` | 服务列表/详情 | 公开 |
| `/orders`, `/orders/:id` | 订单列表/详情 | 需登录 |
| `/wallet` | 钱包 | 需登录 |
| `/chat` | 消息中心 | 需登录 |
| `/admin/*` | 管理后台 | 需管理员 |

## Code Style

- 使用 `<script setup lang="ts">` 语法
- 使用组合式 API
- 样式使用 SCSS + scoped

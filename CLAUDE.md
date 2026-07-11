# CLAUDE.md

此文件用于指导 Claude Code (claude.ai/code) 在该仓库中进行代码开发。

## 常用命令

```sh
yarn dev        # 启动 Vite 开发服务器
yarn build      # TypeScript 类型检查 + Vite 生产构建
yarn lint       # 运行 oxlint
yarn preview    # 本地预览生产构建
```

## 架构概览

### 技术栈

- **框架：** React 19 + TypeScript 6 + Vite 8
- **UI 库：** Ant Design 6 + `@ant-design/icons`
- **路由：** React Router DOM v7，使用嵌套 `<Outlet />` 布局
- **状态：** 所有数据持久化到 `localStorage`，键前缀为 `knowledge_app_` — 无后端
- **样式：** Less CSS 模块（`*.module.less`）+ CSS 自定义属性实现主题化
- **构建：** Vite + `@vitejs/plugin-react`，路径别名 `@` → `src/`

### 数据层（无后端）

所有 CRUD 操作通过 `src/utils/storage.ts` 中的辅助函数读写 `localStorage`。类型定义在 `src/types/index.ts`：

| 键           | 类型              | 说明                               |
| ------------ | ----------------- | ---------------------------------- |
| `knowledge`  | `KnowledgeItem[]` | 知识库条目，包含标题、内容、分类ID |
| `categories` | `Category[]`      | 分类元数据                         |
| `todos`      | `TodoItem[]`      | 待办事项，含完成标记               |
| `theme`      | `ThemeName`       | 持久化的主题偏好                   |

### 路由结构

`src/App.tsx` 定义路由，所有路由包裹在 `AppLayout` 中（通过 `<Outlet />` 渲染页眉 + 内容区）：

| 路径                | 组件              | 文件                          |
| ------------------- | ----------------- | ----------------------------- |
| `/`                 | `Home`            | `src/pages/Home/`             |
| `/company/password` | `CompanyPassword` | `src/pages/Company/Password/` |

路由常量定义在 `src/constants/routes.ts`（`ROUTES`）。

### 主题系统

四个主题（tech / aesthetic / dark / light）由 `ThemeContext`（`src/contexts/ThemeContext.tsx`）管理。每个主题设置：

1. Ant Design `ConfigProvider` 的主题令牌 + 算法
2. 通过 `src/styles/global.less` 在 `<html data-theme="...">` 上设置 CSS 自定义属性

在 Less 模块中使用 CSS 变量（`var(--bg-color)`、`var(--text-color)` 等）实现主题感知的样式。

### 关键目录

```
src/
├── components/       # 共享 UI 组件（AppLayout, SearchBar, CalendarWidget, TodoList, ThemeSwitch, ErrorBoundary）
├── constants/        # 路由定义
├── contexts/         # React 上下文（ThemeContext）
├── pages/            # 路由级别的页面组件（Home, Company/Password）
├── styles/           # 全局 CSS 变量和重置样式
├── types/            # TypeScript 接口
└── utils/            # 存储辅助函数、工具方法
```

### 开发模式

- **组件**采用 `组件名/index.tsx` 结构，可选的 `index.module.less` 样式模块放在同目录下。
- **导入**使用 `@/` 路径别名（例如 `@/utils/storage`、`@/components/CalendarWidget`）。
- **Home 页面的侧边栏导航**使用 antd 的 `Layout.Sider` + `Menu`，通过状态驱动内容切换（参见 `src/pages/Home/index.tsx`）。
- **搜索**使用带防抖的 `AutoComplete`，在 `localStorage` 的知识条目中进行搜索。

### 注意事项

- 禁止使用内联样式（`style={{ ... }}`），请使用 Less cssModule 模块。

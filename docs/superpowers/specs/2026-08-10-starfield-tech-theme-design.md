# Tech 主题星空化设计文档

日期：2026-08-10
状态：已确认（视觉 / 架构 / 影响面三节均获用户批准）

## 背景与目标

现有 tech 主题为浅色蓝白风（`#f0f5ff`），页面静态。目标：

1. tech 主题改为**深色夜空基调**
2. 页面背景加入**极简星空**（静态星星 + 山峦剪影 + 低频流星）
3. 前景**动态粒子跟随鼠标**：鼠标靠近时粒子被吸引聚集形成"星云"，移开后散开

仅影响 tech 主题；aesthetic / dark / light 三个主题零改动。

## 视觉设计

单 canvas 五层绘制（自上而下）：

| 层 | 元素 | 规格 |
|---|---|---|
| 1 | 天空 | 深蓝紫垂直渐变 `#0b1020 → #141b34 → #0d1526` |
| 2 | 背景星 | ~120 颗静态星星，0.5~1.8px，白蓝色，透明度正弦波呼吸闪烁，不随鼠标移动 |
| 3 | 山峦剪影 | 2 层深色群山（canvas 内路径绘制，近山更深，近黑蓝），地平线 1px 淡蓝微光 |
| 4 | 流星 | 白→蓝渐变短线 + 渐细拖尾，30°~60° 斜坠，持续 0.6~1s，随机间隔 8~20 秒一条 |
| 5 | 前景粒子 | ~70 颗亮蓝光点（2~4px，径向光晕），缓慢自漂移，鼠标 <150px 时被吸引聚集 |

配色基调：夜空深蓝（非纯黑），粒子 / 流星 / 星芒用 `#7cc4ff` / `#c8e8ff` 冷光蓝，与 antd 主色 `#1677ff` 同色系。

## 架构设计

**组件**：新建 `src/components/StarFieldBackground/`（`index.tsx` + `index.module.less`），自包含：

- `useEffect` 中初始化 canvas 动画循环，完整 cleanup（取消 rAF、移除监听）
- `devicePixelRatio` 缩放保证高分屏清晰；`resize` 自适应
- 挂载于 `AppLayout` 的 `Layout` 内，`position: fixed` 铺满 + `z-index: 0`；Content 内容层 `z-index: 1`
- `useTheme()` 判断：仅 `themeName === 'tech'` 渲染，切换主题时组件卸载停止动画
- 鼠标坐标：`pointermove` passive 监听写入 ref，每帧读取（rAF 天然节流）
- `prefers-reduced-motion`：降级为静态星空（星星 + 山峦，无粒子/流星/闪烁）
- `visibilitychange` 页面隐藏时暂停 rAF

**粒子吸引算法**：粒子带"鼠标引力向量"——距离 <150px 时引力与距离反比增强，位置以缓动系数 0.06~0.12 向鼠标平滑逼近；鼠标离开后引力归零恢复自然漂移，形成呼吸感，不做生硬吸附。

## 样式影响面（仅 tech 主题）

| 文件 | 改动 |
|---|---|
| `src/styles/global.less` | `[data-theme="tech"]` 变量全部改深色；`--bg-card` 改半透明深色玻璃；浅色径向渐变背景移除（由 canvas 接管） |
| `src/components/AppLayout/index.module.less` | header 深色玻璃；`.content` 加 `position: relative; z-index: 1` |
| 各页面卡片 | 使用 `--bg-card` / `--glass-bg` 变量自动适配；核对硬编码浅色处 |

**风险与对策**：

- tech 主题浅→深翻转，全站核对文字对比度：`--text-color` 改为浅色（`#e8ecf8` 系），`--text-secondary` 相应调亮
- 仅 tech 主题受影响，其余主题通过 CSS 变量隔离保证零影响

## 性能

- 单 canvas + rAF；粒子 70 + 星星 120，远低于性能红线
- 逐帧 canvas 绘制，无 DOM 抖动、无重排
- 页面不可见自动暂停；非 tech 主题组件不挂载，零开销

## 验证

- `yarn build`（TS 类型检查 + Vite 构建）通过
- `yarn dev` 手动验证：粒子吸引聚集、流星坠落、星星闪烁、主题切换、reduced-motion 降级
- 全站走查 tech 主题文字对比度与卡片可读性

# Tech 主题星空化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 tech 主题改造为深色夜空基调，加入 Canvas 自绘的星空（静态星星 + 山峦剪影 + 低频流星）与跟随鼠标吸引聚集的动态粒子。

**Architecture:** 新建自包含的 `StarFieldBackground` Canvas 组件（天空渐变 / 背景星 / 山峦 / 流星 / 粒子五层，单 canvas + rAF），仅 `themeName === 'tech'` 时渲染并铺满视口；tech 主题 CSS 变量与 antd 配置同步改为深色系，卡片走变量自动适配。

**Tech Stack:** React 19、TypeScript、Vite、antd 6、Less CSS Modules。无新增依赖，无测试框架（验证 = `yarn lint` + `yarn build` + `yarn dev` 手动）。

## Global Constraints

- 禁止新增 npm 依赖
- 禁止内联样式（`style={{ ... }}`），一律用 Less cssModule
- 导入使用 `@/` 路径别名
- 组件结构：`组件名/index.tsx` + 同目录 `index.module.less`
- 仅修改 tech 主题；aesthetic / dark / light 三主题零变化（dark 主题已有 `[data-theme="dark"]` 专用规则，不可动）
- 验证命令：`yarn lint`（oxlint）、`yarn build`（tsc -b + vite build）、`yarn dev` 手动验证
- 手动验证前提：浏览器支持 `prefers-reduced-motion` 检测与 Canvas 2D

---

### Task 1: tech 主题深色化（CSS 变量 + antd 配置 + Sider）

**Files:**
- Modify: `src/styles/global.less:17-29`（`[data-theme="tech"]` 变量块）
- Delete: `src/styles/global.less:136-149`（tech 浅色径向渐变背景规则）
- Modify: `src/contexts/ThemeContext.tsx:30-38`（tech 主题 antd 配置）
- Modify: `src/pages/Home/index.tsx:22`（Sider `theme="light"`）

**Interfaces:**
- Consumes: 现有 `ThemeName`、`ThemeContext`
- Produces: 深色 tech 主题 CSS 变量与 antd tokens（供 Task 2-5 使用）

- [ ] **Step 1: 改写 `[data-theme="tech"]` 变量块**

把 [global.less](src/styles/global.less) 中 `[data-theme="tech"] { ... }` 块（第 17-29 行）整体替换为：

```less
[data-theme="tech"] {
  --bg-color: #0b1020;
  --bg-card: rgba(19, 27, 48, 0.72);
  --text-color: #e8ecf8;
  --text-secondary: #8b95b5;
  --border-color: #243356;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 8px 24px rgba(22, 119, 255, 0.25);
  --header-bg: rgba(11, 16, 32, 0.72);
  --glass-bg: rgba(19, 27, 48, 0.6);
  --gradient-1: linear-gradient(135deg, #1677ff 0%, #69b1ff 100%);
  --gradient-2: linear-gradient(135deg, #101a30 0%, #0d1526 100%);
}
```

同时删除第 136-149 行的 tech 浅色径向渐变规则（`[data-theme="tech"] .app-layout { ... }`，含两段 `radial-gradient`）——星空背景由 Task 2 的 canvas 接管。

- [ ] **Step 2: 改写 tech 主题的 antd 配置**

[ThemeContext.tsx](src/contexts/ThemeContext.tsx) 中 `tech` 的 `algorithm` 由 `theme.defaultAlgorithm` 改为 `theme.darkAlgorithm`，并补充深色 tokens（与 CSS 变量同色系）：

```ts
tech: {
  token: {
    colorPrimary: '#1677ff',
    colorLink: '#69b1ff',
    borderRadius: 8,
    colorBgContainer: '#131b30',
    colorBgElevated: '#1a2540',
    colorBgLayout: '#0b1020',
    colorBorder: '#243356',
    colorText: '#e8ecf8',
    colorTextSecondary: '#8b95b5',
  },
  algorithm: theme.darkAlgorithm,
},
```

- [ ] **Step 3: 修正 Home 侧边栏硬编码的浅色**

[Home/index.tsx:22](src/pages/Home/index.tsx#L22) 的 `<Sider width={200} theme="light" className={styles.sidebar}>` 改为 `<Sider width={200} theme="dark" className={styles.sidebar}>`。

- [ ] **Step 4: 验证**

```bash
yarn lint && yarn build
```

Run: `yarn dev`，在浏览器手动切换 4 个主题：
- tech：整体深色，文字/卡片可读，antd Menu 深色
- aesthetic / dark / light：外观与改动前完全一致（回归）

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.less src/contexts/ThemeContext.tsx src/pages/Home/index.tsx
git commit -m "feat: tech主题深色化 - 变量/antd配置/Sider适配"
```

---

### Task 2: StarFieldBackground 静态层（天空、背景星、山峦）

**Files:**
- Create: `src/components/StarFieldBackground/index.tsx`
- Create: `src/components/StarFieldBackground/index.module.less`
- Modify: `src/components/AppLayout/index.tsx:23`（挂载组件）
- Modify: `src/components/AppLayout/index.module.less:61-67`（content 层叠）

**Interfaces:**
- Consumes: `useTheme()`（来自 `@/contexts/ThemeContext`，值类型 `ThemeName`）
- Produces: `<StarFieldBackground />`（无 props、无子元素，自包含生命周期）——供 Task 3/4 在组件内部增量扩展

- [ ] **Step 1: 创建组件 index.tsx（静态层 + 生命周期骨架）**

```tsx
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './index.module.less';

// ---- 常量 ----
const STARS_COUNT = 120;
const SKY_TOP = '#0b1020';
const SKY_MID = '#141b34';
const SKY_BOTTOM = '#0d1526';
const STAR_COLOR = '200, 225, 255';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

interface Size {
  width: number;
  height: number;
}

// 天空渐变：深蓝紫
function drawSky(ctx: CanvasRenderingContext2D, size: Size): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, size.height);
  gradient.addColorStop(0, SKY_TOP);
  gradient.addColorStop(0.6, SKY_MID);
  gradient.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.width, size.height);
}

// 山峦：正弦叠加生成两层山脊 + 地平线微光
function drawMountains(ctx: CanvasRenderingContext2D, size: Size): void {
  const { width, height } = size;
  const glowY = height * 0.78;

  // 地平线微光
  const glow = ctx.createLinearGradient(0, glowY - 60, 0, glowY + 60);
  glow.addColorStop(0, 'rgba(60, 110, 180, 0)');
  glow.addColorStop(0.5, 'rgba(60, 110, 180, 0.22)');
  glow.addColorStop(1, 'rgba(60, 110, 180, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, glowY - 60, width, 120);

  const ridge = (baseY: number, a1: number, f1: number, p1: number, a2: number, f2: number, p2: number): number[] => {
    const ys: number[] = [];
    for (let x = 0; x <= width; x += 8) {
      ys.push(
        baseY +
          a1 * Math.sin((x / width) * f1 * Math.PI * 2 + p1) +
          a2 * Math.sin((x / width) * f2 * Math.PI * 2 + p2),
      );
    }
    return ys;
  };

  // 远山（偏亮）
  const far = ridge(height * 0.74, 14, 1.3, 0.5, 7, 3.1, 1.8);
  ctx.fillStyle = '#111b33';
  ctx.beginPath();
  ctx.moveTo(0, height);
  far.forEach((y, i) => ctx.lineTo(i * 8, y));
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // 近山（更深）
  const near = ridge(height * 0.84, 22, 0.9, 2.2, 10, 2.7, 0.3);
  ctx.fillStyle = '#0a0f1e';
  ctx.beginPath();
  ctx.moveTo(0, height);
  near.forEach((y, i) => ctx.lineTo(i * 8, y));
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

// 背景星：静态位置 + 呼吸闪烁
function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], time: number): void {
  for (const s of stars) {
    const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(time * s.speed + s.phase));
    ctx.fillStyle = `rgba(${STAR_COLOR}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createStars(size: Size): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STARS_COUNT; i++) {
    stars.push({
      x: Math.random() * size.width,
      y: Math.random() * size.height * 0.78, // 星星只出现在山峦以上
      r: 0.5 + Math.random() * 1.3,
      baseAlpha: 0.35 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.003,
    });
  }
  return stars;
}

export default function StarFieldBackground() {
  const { themeName } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (themeName !== 'tech') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let size: Size = { width: window.innerWidth, height: window.innerHeight };
    let stars: Star[] = createStars(size);
    let rafId = 0;
    let running = true;
    let startTime = performance.now();

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      size = { width: window.innerWidth, height: window.innerHeight };
      canvas.width = size.width * dpr;
      canvas.height = size.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(size);
    };
    resize();
    window.addEventListener('resize', resize);

    // 无障碍降级：静态星空（只绘制一帧）
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        running = true;
        startTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const draw = (time: number): void => {
      drawSky(ctx, size);
      drawMountains(ctx, size);
      drawStars(ctx, stars, time);
    };

    function tick(now: number): void {
      if (!running) return;
      const time = now - startTime;
      draw(time);
      rafId = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      draw(0);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [themeName]);

  if (themeName !== 'tech') return null;

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
```

- [ ] **Step 2: 创建 index.module.less**

```less
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
```

- [ ] **Step 3: 挂载到 AppLayout 并提升内容层**

[AppLayout/index.tsx:23](src/components/AppLayout/index.tsx#L23) 的 `<Layout className={\`app-layout ${styles.layout}\`}>` 内、`<Header>` 之前插入 `<StarFieldBackground />`，并在文件顶部添加 `import StarFieldBackground from '@/components/StarFieldBackground';`。

[AppLayout/index.module.less](src/components/AppLayout/index.module.less) 的 `.content` 块追加：

```less
.content {
  /* ...已有属性保留... */
  position: relative;
  z-index: 1;
}
```

（header 已是 `z-index: 100`，无需改动。）

- [ ] **Step 4: 验证**

```bash
yarn lint && yarn build
```

Run: `yarn dev`，切到 tech 主题：
- 全屏深蓝紫渐变夜空、山峦剪影贴地平线、地平线淡蓝微光
- 背景星缓慢呼吸闪烁；鼠标移动时星星不跟随（静态层）
- 窗口缩放后星空重铺、不拉伸变形
- 切到其他主题：组件消失，页面正常

- [ ] **Step 5: Commit**

```bash
git add src/components/StarFieldBackground src/components/AppLayout
git commit -m "feat: tech主题星空背景 - 天空/背景星/山峦静态层"
```

---

### Task 3: 动态粒子与鼠标吸引聚集

**Files:**
- Modify: `src/components/StarFieldBackground/index.tsx`

**Interfaces:**
- Consumes: Task 2 的 `Star`、`Size`、`drawSky`、`drawMountains`、`drawStars`、`createStars`、rAF 循环骨架
- Produces: `Particle` 类型、`createParticles`、`updateParticles`、`drawParticles` 与鼠标坐标 ref（Task 4 复用同一循环）

- [ ] **Step 1: 追加粒子相关类型与常量**

在 `interface Star` 之后、`interface Size` 之前插入：

```ts
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
}
```

在常量区追加：

```ts
const PARTICLES_COUNT = 70;
const MOUSE_RADIUS = 150;
const PARTICLE_COLOR = '124, 196, 255';
```

- [ ] **Step 2: 追加粒子创建 / 更新 / 绘制函数**

在 `createStars` 函数之后追加：

```ts
function createParticles(size: Size): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLES_COUNT; i++) {
    particles.push({
      x: Math.random() * size.width,
      y: Math.random() * size.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

// 自然漂移 + 鼠标引力（弹性聚集，不做生硬吸附）
function updateParticles(
  particles: Particle[],
  mouse: { x: number; y: number; active: boolean },
  size: Size,
): void {
  for (const p of particles) {
    // 随机游走
    p.vx += (Math.random() - 0.5) * 0.05;
    p.vy += (Math.random() - 0.5) * 0.05;
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0.4) {
      p.vx *= 0.98;
      p.vy *= 0.98;
    }

    // 鼠标引力：150px 内随距离反比增强
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_RADIUS && dist > 0.5) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.08;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    // 边界回弹
    if (p.x < 0 || p.x > size.width) p.vx *= -1;
    if (p.y < 0 || p.y > size.height) p.vy *= -1;
    p.x = Math.min(Math.max(p.x, 0), size.width);
    p.y = Math.min(Math.max(p.y, 0), size.height);
  }
}

// 径向光晕光点
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], time: number): void {
  for (const p of particles) {
    const alpha = 0.4 + 0.4 * Math.sin(time * 0.002 + p.phase);
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
    glow.addColorStop(0, `rgba(${PARTICLE_COLOR}, ${(0.75 * alpha).toFixed(3)})`);
    glow.addColorStop(1, `rgba(${PARTICLE_COLOR}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

- [ ] **Step 3: 接入组件循环**

在组件 `useEffect` 内：

1. 在 `let stars: Star[] = createStars(size);` 之后追加：

```ts
let particles: Particle[] = createParticles(size);
```

2. 在 `resize` 函数内 `stars = createStars(size);` 之后追加：

```ts
particles = createParticles(size);
```

3. 在 `window.addEventListener('resize', resize);` 之后追加鼠标监听：

```ts
const mouse = { x: -9999, y: -9999, active: false };
const onPointerMove = (e: PointerEvent): void => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
};
window.addEventListener('pointermove', onPointerMove, { passive: true });
```

4. 在 `draw` 函数内 `drawStars(ctx, stars, time);` 之后追加：

```ts
updateParticles(particles, mouse, size);
drawParticles(ctx, particles, time);
```

5. 在 cleanup 的 `window.removeEventListener('resize', resize);` 之后追加：

```ts
window.removeEventListener('pointermove', onPointerMove);
```

- [ ] **Step 4: 验证**

```bash
yarn lint && yarn build
```

Run: `yarn dev`，tech 主题：
- 约 70 颗亮蓝光点缓慢自漂移
- 鼠标移入 150px 范围，粒子平滑聚集到光标周围形成星云；移开后弹性散开恢复漂移
- 粒子不与星星/山峦混淆（粒子更大更亮）
- 切走主题再切回，粒子重新初始化

- [ ] **Step 5: Commit**

```bash
git add src/components/StarFieldBackground/index.tsx
git commit -m "feat: tech主题粒子交互 - 鼠标吸引聚集星云"
```

---

### Task 4: 流星系统

**Files:**
- Modify: `src/components/StarFieldBackground/index.tsx`

**Interfaces:**
- Consumes: Task 2/3 的 rAF 循环、`Size`
- Produces: 无（内部状态）

- [ ] **Step 1: 追加流星类型与常量**

在 `interface Particle` 之后追加：

```ts
interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 → 1 生命周期进度
  maxLife: number; // 以帧为单位
}
```

在常量区追加：

```ts
const METEOR_MIN_INTERVAL = 8000;
const METEOR_MAX_INTERVAL = 20000;
```

- [ ] **Step 2: 追加流星生成 / 更新 / 绘制函数**

在 `drawParticles` 函数之后追加：

```ts
function spawnMeteor(size: Size): Meteor {
  const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6); // 30°~60° 斜坠
  const speed = 6 + Math.random() * 4;
  return {
    x: size.width * (0.5 + Math.random() * 0.5), // 起点在右上半区
    y: size.height * Math.random() * 0.3,
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 60 + Math.random() * 30, // 0.6~1s（60fps）
  };
}

function updateMeteors(meteors: Meteor[], size: Size): void {
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.life += 1;
    m.x += m.vx;
    m.y += m.vy;
    if (m.life >= m.maxLife || m.x < -100 || m.y > size.height) {
      meteors.splice(i, 1);
    }
  }
}

// 白→蓝渐变拖尾，透明度随 life 先升后降
function drawMeteor(ctx: CanvasRenderingContext2D, m: Meteor): void {
  const progress = m.life / m.maxLife;
  const alpha = Math.sin(progress * Math.PI);
  const dirX = m.vx / Math.hypot(m.vx, m.vy);
  const dirY = m.vy / Math.hypot(m.vx, m.vy);
  const tailLen = 60 + progress * 40;
  const tailX = m.x - dirX * tailLen;
  const tailY = m.y - dirY * tailLen;
  const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
  gradient.addColorStop(0, 'rgba(200, 232, 255, 0)');
  gradient.addColorStop(1, `rgba(220, 240, 255, ${(0.9 * alpha).toFixed(3)})`);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(m.x, m.y);
  ctx.stroke();
}
```

- [ ] **Step 3: 接入组件循环**

1. 在 `let particles: Particle[] = createParticles(size);` 之后追加：

```ts
let meteors: Meteor[] = [];
let nextMeteorAt = performance.now() + METEOR_MIN_INTERVAL + Math.random() * (METEOR_MAX_INTERVAL - METEOR_MIN_INTERVAL);
```

2. 在 `draw` 函数内 `drawParticles(ctx, particles, time);` 之后追加：

```ts
if (performance.now() > nextMeteorAt) {
  meteors.push(spawnMeteor(size));
  nextMeteorAt = performance.now() + METEOR_MIN_INTERVAL + Math.random() * (METEOR_MAX_INTERVAL - METEOR_MIN_INTERVAL);
}
updateMeteors(meteors, size);
meteors.forEach((m) => drawMeteor(ctx, m));
```

- [ ] **Step 4: 验证**

```bash
yarn lint && yarn build
```

Run: `yarn dev`，tech 主题：
- 每 8~20 秒随机生成一条流星，从右上斜向左下坠落
- 白→蓝渐变、渐细拖尾，全程约 0.6~1s，末段渐隐
- 等待 2 分钟确认流星持续出现且不叠加过多（同时最多约 2 条）

- [ ] **Step 5: Commit**

```bash
git add src/components/StarFieldBackground/index.tsx
git commit -m "feat: tech主题流星系统 - 低频随机坠落"
```

---

### Task 5: 全站走查与收尾验证

**Files:**
- Modify: `src/components/MarkdownRenderer/index.module.less:126-132`（tech 深色下的表格斑马纹/hover）
- Verify: `src/pages/Home/index.tsx`、`src/pages/Company/`、`src/components/`（对比度与硬编码浅色）

**Interfaces:**
- Consumes: Task 1 的深色变量与 antd 配置

- [ ] **Step 1: 为 tech 深色主题补充表格高亮覆盖**

在 [MarkdownRenderer/index.module.less](src/components/MarkdownRenderer/index.module.less) 现有 `[data-theme="dark"] .mdxWrapper tr:nth-child(even)` 规则（第 134-141 行）之后追加同款 tech 规则：

```less
[data-theme="tech"] .mdxWrapper tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

[data-theme="tech"] .mdxWrapper tr:hover {
  background: rgba(255, 255, 255, 0.04);
}
```

- [ ] **Step 2: 全站走查 tech 主题**

Run: `yarn dev`，切到 tech 主题，逐页核对（表格核对一个包含 Markdown 渲染的页面即可）：

- [ ] Home 页：Sider/Menu 深色；TodoList、CalendarWidget、QuickLink 卡片文字对比度达标
- [ ] 知识库详情（MarkdownRenderer）：`pre`/`blockquote`/表格头为深色渐变底、文字可读；表格斑马纹与 hover 可见
- [ ] Company 页面：`--bg-card`、`--gradient-2` 处深色化正常
- [ ] 弹窗/下拉（antd Elevated 组件）为深色
- [ ] Header 日期文字、logo 图标可见

如发现任何仍为浅色的硬编码处，用 CSS 变量（`var(--bg-card)`、`var(--text-color)`、`var(--gradient-2)`）替换，或追加 `[data-theme="tech"]` 专用规则（复制 dark 主题现有写法）。完成后同样运行验证并提交。

- [ ] **Step 3: 最终验证**

```bash
yarn lint && yarn build
```

Run: `yarn dev`，全流程最终验收：
- tech：星空 + 山峦 + 流星 + 粒子聚集 + 深色卡片，整体协调
- 切换 4 个主题无报错、无残留（切走后 canvas 卸载）
- 浏览器开启"减弱动态效果"（reduced-motion）：静止星空正常显示、无粒子/流星/闪烁

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: tech主题星空化 - 全站走查收尾"
```

---

## Self-Review 记录

**Spec coverage:**
- 深色夜空基调 → Task 1
- 星空五层（天空/背景星/山峦/流星/粒子）→ Task 2（三层静态）+ Task 3（粒子）+ Task 4（流星）
- 粒子鼠标吸引聚集 → Task 3
- reduced-motion 降级 / visibilitychange 暂停 → Task 2 Step 1
- 主题联动（仅 tech 渲染）→ Task 2 Step 1（`themeName !== 'tech'` 早退）
- 对比度走查 → Task 1 Step 4 + Task 5

**已知偏差（相对设计文档）：**
- 设计文档未明确 antd 组件深色化方案，计划补充为 `darkAlgorithm` + 深色 tokens（Task 1 Step 2）——不引入新依赖的唯一可行路径
- 设计文档说"卡片间隙透出星空"，实际 `--bg-card` 为 `rgba(19, 27, 48, 0.72)` 半透明玻璃 + 现有 `backdrop-filter` 实现

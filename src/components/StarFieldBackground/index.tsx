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
      y: Math.random() * size.height * 0.7, // 星星只出现在山峦以上
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
    let stars: Star[];
    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    // 无障碍降级：静态星空（只绘制一帧）
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (time: number): void => {
      drawSky(ctx, size);
      drawMountains(ctx, size);
      drawStars(ctx, stars, time);
    };

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      size = { width: window.innerWidth, height: window.innerHeight };
      canvas.width = size.width * dpr;
      canvas.height = size.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(size);
      if (reducedMotion) draw(0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        if (reducedMotion) {
          draw(0);
        } else {
          running = true;
          rafId = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

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

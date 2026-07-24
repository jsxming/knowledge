import type { ComponentType, ReactNode } from 'react';

/** MarkdownRenderer 组件属性 */
export interface MarkdownRendererProps {
  /** MDX 内容组件（从 .mdx 文件导入的默认导出） */
  content?: ComponentType;
  /** 区块标题，不传则不显示标题区域 */
  title?: string;
  /** 额外的 MDX 组件覆写，会与默认覆写合并（后者优先级更高） */
  components?: Record<string, ComponentType<any>>;
  /** 额外 CSS 类名 */
  className?: string;
  /** 是否显示页眉标题区域，默认 true */
  showHeader?: boolean;
  /** 渲染失败时的自定义回退 UI */
  errorFallback?: ReactNode;
}

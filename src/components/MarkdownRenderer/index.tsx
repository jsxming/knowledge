import { Component, type ReactNode } from 'react';
import { Button } from 'antd';
import { MDXProvider } from '@mdx-js/react';
import { FileTextOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import type { MarkdownRendererProps } from './types';
import styles from './index.module.less';

/* ================================================================
 * React 的错误捕获（componentDidCatch）必须由 class 组件实现。
 * MdxErrorBoundary 是一个不对外暴露的内部实现细节，仅用于捕获
 * MDX 内容渲染阶段的错误。MarkdownRenderer 本身是函数组件。
 * ================================================================ */

interface BoundaryProps {
  children: ReactNode;
  onCatch: (error: Error) => void;
  fallback: (retry: () => void) => ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MdxErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onCatch(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.handleRetry);
    }
    return this.props.children;
  }
}

/* ================================================================
 * 默认的 MDX 组件覆写 — 安全/行为层面的增强，不涉及样式
 * （样式由 CSS 模块处理）
 * ================================================================ */

const defaultComponents: Record<string, React.ComponentType<any>> = {
  a: ({ href, children, ...rest }) => (
    <a
      href={href}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel={href?.startsWith('#') ? undefined : 'noopener noreferrer'}
      {...rest}
    >
      {children}
    </a>
  ),
};

/* ================================================================
 * MarkdownRenderer — 通用 MDX/Markdown 渲染函数组件
 * ================================================================ */

interface ErrorUIProps {
  error: Error | null;
  onRetry: () => void;
}

function DefaultErrorUI({ error, onRetry }: ErrorUIProps) {
  return (
    <div className={styles.errorState}>
      <WarningOutlined className={styles.errorIcon} />
      <p className={styles.errorText}>内容渲染失败</p>
      {error && (
        <pre className={styles.errorDetail}>{error.message}</pre>
      )}
      <Button
        type="primary"
        ghost
        size="small"
        icon={<ReloadOutlined />}
        onClick={onRetry}
      >
        重试
      </Button>
    </div>
  );
}

function DefaultEmptyUI() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>暂无可渲染的内容</p>
    </div>
  );
}

export default function MarkdownRenderer({
  content: Content,
  title,
  components,
  className,
  showHeader = true,
  errorFallback,
}: MarkdownRendererProps) {
  // —— 空内容 ——
  if (!Content) {
    return errorFallback ?? <DefaultEmptyUI />;
  }

  const mergedComponents = { ...defaultComponents, ...components };

  const renderErrorFallback = (retry: () => void) => {
    return (
      errorFallback ?? <DefaultErrorUI error={null} onRetry={retry} />
    );
  };

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      {showHeader && title && (
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FileTextOutlined className={styles.titleIcon} />
            {title}
          </h2>
        </div>
      )}

      <div className={styles.mdxWrapper}>
        <MdxErrorBoundary
          onCatch={(error) => console.error('[MarkdownRenderer] 渲染错误:', error)}
          fallback={renderErrorFallback}
        >
          <MDXProvider components={mergedComponents}>
            <Content />
          </MDXProvider>
        </MdxErrorBoundary>
      </div>
    </div>
  );
}

export type { MarkdownRendererProps } from './types';

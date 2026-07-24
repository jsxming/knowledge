import MarkdownRenderer from '@/components/MarkdownRenderer';
import DemoContent from './index.mdx';

export default function MarkdownDemo() {
  return (
    <MarkdownRenderer
      content={DemoContent}
      title="MDX Markdown 渲染演示"
    />
  );
}

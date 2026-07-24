import MarkdownRenderer from '@/components/MarkdownRenderer';
import DemoContent from './index.mdx';

const ClaudeCode = () => {
    return (
        <MarkdownRenderer
            content={DemoContent}
            title="MDX ClaudeCode"
        />
    );
}

export default ClaudeCode

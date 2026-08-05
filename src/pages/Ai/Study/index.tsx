import MarkdownRenderer from '@/components/MarkdownRenderer';
import DemoContent from './index.mdx';

const Study = () => {
    return (
        <MarkdownRenderer
            content={DemoContent}
            title="MDX ClaudeCode"
        />
    );
}

export default Study

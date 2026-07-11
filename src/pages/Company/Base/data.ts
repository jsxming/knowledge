import { getItem, setItem, generateId } from "@/utils/storage";
import type { QuickLink, QuickLinkCategory } from "@/types";

const STORAGE_KEY_LINKS = "quick_links";
const STORAGE_KEY_CATEGORIES = "quick_link_categories";

const defaultCategories: QuickLinkCategory[] = [
  { id: "company", name: "公司", icon: "🏢" },
  { id: "dev", name: "开发工具", icon: "⚙️" },
  { id: "ai", name: "AI 工具", icon: "🤖" },
  { id: "design", name: "设计资源", icon: "🎨" },
  { id: "docs", name: "常用文档", icon: "📄" },
  { id: "news", name: "新闻资讯", icon: "📰" },
];

const defaultLinks: QuickLink[] = [
  // 公司
  {
    id: generateId(),
    title: "Jira My Task",
    url: "https://spotec-net.atlassian.net/issues/?filter=10107",
    description: "我的任务",
    categoryId: "company",
  },
  // 开发工具
  {
    id: generateId(),
    title: "GitHub",
    url: "https://github.com",
    description: "代码托管与协作平台",
    categoryId: "dev",
  },
  {
    id: generateId(),
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    description: "开发者问答社区",
    categoryId: "dev",
  },
  {
    id: generateId(),
    title: "npm",
    url: "https://www.npmjs.com",
    description: "Node.js 包管理器",
    categoryId: "dev",
  },
  {
    id: generateId(),
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/zh-CN/",
    description: "Web 技术文档",
    categoryId: "dev",
  },
  {
    id: generateId(),
    title: "CodeSandbox",
    url: "https://codesandbox.io",
    description: "在线代码沙箱",
    categoryId: "dev",
  },
  // AI 工具
  {
    id: generateId(),
    title: "ChatGPT",
    url: "https://chatgpt.com",
    description: "OpenAI 对话助手",
    categoryId: "ai",
  },
  {
    id: generateId(),
    title: "Claude",
    url: "https://claude.ai",
    description: "Anthropic AI 助手",
    categoryId: "ai",
  },
  {
    id: generateId(),
    title: "DeepSeek",
    url: "https://chat.deepseek.com",
    description: "深度求索 AI 助手",
    categoryId: "ai",
  },
  {
    id: generateId(),
    title: "Midjourney",
    url: "https://www.midjourney.com",
    description: "AI 图像生成",
    categoryId: "ai",
  },
  {
    id: generateId(),
    title: "Perplexity",
    url: "https://www.perplexity.ai",
    description: "AI 搜索引擎",
    categoryId: "ai",
  },
  // 设计资源
  {
    id: generateId(),
    title: "Figma",
    url: "https://www.figma.com",
    description: "协作式 UI 设计工具",
    categoryId: "design",
  },
  {
    id: generateId(),
    title: "Dribbble",
    url: "https://dribbble.com",
    description: "设计作品展示平台",
    categoryId: "design",
  },
  {
    id: generateId(),
    title: "iconfont",
    url: "https://www.iconfont.cn",
    description: "阿里巴巴矢量图标库",
    categoryId: "design",
  },
  {
    id: generateId(),
    title: "Coolors",
    url: "https://coolors.co",
    description: "配色方案生成器",
    categoryId: "design",
  },
  // 常用文档
  {
    id: generateId(),
    title: "React",
    url: "https://react.dev",
    description: "React 官方文档",
    categoryId: "docs",
  },
  {
    id: generateId(),
    title: "Vue.js",
    url: "https://vuejs.org",
    description: "Vue.js 官方文档",
    categoryId: "docs",
  },
  {
    id: generateId(),
    title: "Ant Design",
    url: "https://ant.design",
    description: "Ant Design 组件库",
    categoryId: "docs",
  },
  {
    id: generateId(),
    title: "TypeScript",
    url: "https://www.typescriptlang.org",
    description: "TypeScript 官方文档",
    categoryId: "docs",
  },
  {
    id: generateId(),
    title: "Vite",
    url: "https://vite.dev",
    description: "前端构建工具",
    categoryId: "docs",
  },
  // 新闻资讯
  {
    id: generateId(),
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    description: "科技新闻社区",
    categoryId: "news",
  },
  {
    id: generateId(),
    title: "掘金",
    url: "https://juejin.cn",
    description: "中文技术社区",
    categoryId: "news",
  },
  {
    id: generateId(),
    title: "InfoQ",
    url: "https://www.infoq.cn",
    description: "技术趋势与实践",
    categoryId: "news",
  },
];

export function getCategories(): QuickLinkCategory[] {
  return getItem<QuickLinkCategory[]>(
    STORAGE_KEY_CATEGORIES,
    defaultCategories,
  );
}

export function saveCategories(categories: QuickLinkCategory[]): void {
  setItem(STORAGE_KEY_CATEGORIES, categories);
}

export function getLinks(): QuickLink[] {
  return getItem<QuickLink[]>(STORAGE_KEY_LINKS, defaultLinks);
}

export function saveLinks(links: QuickLink[]): void {
  setItem(STORAGE_KEY_LINKS, links);
}

export function addLink(link: Omit<QuickLink, "id">): QuickLink {
  const links = getLinks();
  const newLink: QuickLink = { ...link, id: generateId() };
  links.push(newLink);
  saveLinks(links);
  return newLink;
}

export function deleteLink(id: string): void {
  const links = getLinks();
  saveLinks(links.filter((l) => l.id !== id));
}

export function addCategory(name: string, icon: string): QuickLinkCategory {
  const categories = getCategories();
  const newCategory: QuickLinkCategory = { id: generateId(), name, icon };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

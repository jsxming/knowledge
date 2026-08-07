import type { MenuProps } from "antd";
import aiPath from "@/routes/paths/ai";
import companyPath from "@/routes/paths/company";
import markdownPath from "@/routes/paths/markdown";

type MenuItem = Required<MenuProps>["items"][number];

export const menuItems: MenuItem[] = [
	{
		key: "company",
		label: "Company",
		children: [{ key: companyPath.BASE, label: "常用" }],
	},
	{
		key: "markdown",
		label: "Markdown",
		children: [{ key: markdownPath.DEMO, label: "MDX 演示" }],
	},
	{
		key: "ai",
		label: "AI",
		children: [
			{ key: aiPath.BASE, label: "ClaudeCode" },
			{ key: aiPath.STUDY, label: "AI编程落地指南" },
		],
	},
];

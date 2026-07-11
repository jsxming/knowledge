export type ThemeName = 'tech' | 'aesthetic' | 'dark' | 'light';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface QuickLinkCategory {
  id: string;
  name: string;
  icon: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  description: string;
  categoryId: string;
}

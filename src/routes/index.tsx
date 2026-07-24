import { useRoutes, Navigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import CompanyBase from '@/pages/Company/Base';
import MarkdownDemo from '@/pages/MarkdownDemo';
import { ROUTES } from './paths/index';
import companyPath from './paths/company';
import markdownPath from './paths/markdown';
import aiPath from './paths/ai';
import ClaudeCode from '@/pages/Ai/ClaudeCode';

const routeConfig = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <Home />,
        children: [
          { index: true, element: <Navigate to="company/base" replace /> },
          { path: companyPath.BASE, element: <CompanyBase /> },
          { path: markdownPath.DEMO, element: <MarkdownDemo /> },
          { path: aiPath.BASE, element: <ClaudeCode /> },
        ],
      },
    ],
  },
];

export default function AppRoutes() {
  return useRoutes(routeConfig);
}

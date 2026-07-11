import { useRoutes, Navigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import CompanyBase from '@/pages/Company/Base';
import { ROUTES } from './paths/index';
import companyPath from './paths/company'

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
        ],
      },
    ],
  },
];

export default function AppRoutes() {
  return useRoutes(routeConfig);
}

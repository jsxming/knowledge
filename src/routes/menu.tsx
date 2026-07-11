import type { MenuProps } from 'antd';
import companyPath from '@/routes/paths/company';

type MenuItem = Required<MenuProps>['items'][number];

export const menuItems: MenuItem[] = [
  {
    key: 'company',
    label: 'Company',
    children: [
      { key: companyPath.BASE, label: '常用' },
    ],
  },
];

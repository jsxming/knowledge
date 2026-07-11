import { Card, Typography } from 'antd';
import EasyTable from '@/components/Table';
import type { EasyTableProps } from '@/components/Table';
import { mockPasswords, type PasswordItem } from './data';
import styles from './index.module.less';

const { Title } = Typography;

const columns: EasyTableProps<PasswordItem>['columns'] = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '账号', dataIndex: 'account', key: 'account', width: 200 },
  {
    title: '密码',
    dataIndex: 'password',
    key: 'password',
    width: 200,
  },
  { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
];

export default function Password() {
  return (
    <Card>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>密码管理</Title>
      </div>

      <EasyTable<PasswordItem>
        columns={columns}
        dataSource={mockPasswords}
        pagination={false}
        rowKey="id"
      />
    </Card>
  );
}

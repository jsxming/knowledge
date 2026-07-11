import { useState, useEffect } from 'react';
import { Layout, Typography } from 'antd';
import { Outlet, Link } from 'react-router-dom';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ThemeSwitch from '@/components/ThemeSwitch';
import styles from './index.module.less';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const [time, setTime] = useState(dayjs().format('HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout className={`app-layout ${styles.layout}`}>
      <Header className={styles.header}>
        <Link to="/" className={styles.logoLink}>
          <BookOutlined className={styles.logoIcon} />
        </Link>
        <div className={styles.headerRight}>
          <Text className={styles.dateText}>
            {dayjs().format('YYYY-MM-DD')}{' '}
            <span className={styles.timeText}>{time}</span>
          </Text>
          <ThemeSwitch />
        </div>
      </Header>

      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}

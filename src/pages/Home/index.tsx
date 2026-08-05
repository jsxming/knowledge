import { Row, Col, Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from '@/routes/menu';
import type { MenuProps } from 'antd';
import styles from './index.module.less';

const { Sider, Content } = Layout;

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const onClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} md={24}>
          <Layout className={styles.sidebarLayout}>
            <Sider width={200} theme="light" className={styles.sidebar}>
              <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                defaultOpenKeys={['company']}
                items={menuItems}
                onClick={onClick}
                className={styles.sidebarMenu}
              />
            </Sider>
            <Content className={styles.content}>
              <Outlet />
            </Content>
          </Layout>
        </Col>
        {/* <Col xs={24} md={7}>
          <CalendarWidget />
          <TodoList />
        </Col> */}
      </Row>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card, Row, Col, Input, Modal, Form, Select, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined, GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import type { QuickLink } from '@/types';
import { getCategories, getLinks, addLink, deleteLink } from './data';
import styles from './index.module.less';

/** 从 URL 中提取域名 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function Base() {
  const [links, setLinks] = useState<QuickLink[]>(getLinks);
  const [categories] = useState(getCategories);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q),
    );
  }, [links, search]);

  const grouped = useMemo(() => {
    const map: Record<string, QuickLink[]> = {};
    filteredLinks.forEach((link) => {
      if (!map[link.categoryId]) map[link.categoryId] = [];
      map[link.categoryId].push(link);
    });
    return map;
  }, [filteredLinks]);

  const handleDelete = (id: string) => {
    deleteLink(id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
    message.success('链接已删除');
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    const newLink = addLink({
      title: values.title,
      url: values.url,
      description: values.description || '',
      categoryId: values.category,
    });
    setLinks((prev) => [...prev, newLink]);
    form.resetFields();
    setAddModalOpen(false);
    message.success('链接已添加');
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || '🔗';

  return (
    <div className={styles.container}>
      {/* 页头 */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <GlobalOutlined className={styles.titleIcon} />
          网站导航
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            className={styles.searchBar}
            placeholder="搜索网站..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
            添加
          </Button>
        </div>
      </div>

      {/* 链接展示 */}
      {filteredLinks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyText}>
            {search ? '没有匹配的网站' : '还没有添加任何链接，点击右上角开始添加'}
          </div>
        </div>
      ) : (
        categories.map((cat) => {
          const catLinks = grouped[cat.id];
          if (!catLinks || catLinks.length === 0) return null;
          return (
            <section key={cat.id} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <span className={styles.linkCount}>({catLinks.length})</span>
              </div>
              <Row gutter={[12, 12]}>
                {catLinks.map((link) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={link.id}>
                    <div style={{ position: 'relative' }}>
                      <Card
                        size="small"
                        className={styles.linkCard}
                        onClick={() => openLink(link.url)}
                        styles={{ body: { padding: '12px' } }}
                      >
                        <div className={styles.linkCardBody}>
                          <div className={styles.favicon}>
                            {imgErrors[link.id] ? (
                              <span>{getCategoryIcon(link.categoryId)}</span>
                            ) : (
                              <img
                                className={styles.faviconImg}
                                src={`https://www.google.com/s2/favicons?domain=${getDomain(link.url)}&sz=32`}
                                alt=""
                                onError={() =>
                                  setImgErrors((prev) => ({ ...prev, [link.id]: true }))
                                }
                              />
                            )}
                          </div>
                          <div className={styles.linkInfo}>
                            <div className={styles.linkTitle}>{link.title}</div>
                            <div className={styles.linkDesc}>{link.description}</div>
                            <div className={styles.linkUrl}>{link.url}</div>
                          </div>
                        </div>
                      </Card>
                      <DeleteOutlined
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: '确认删除',
                            content: `确定要删除「${link.title}」吗？`,
                            okText: '删除',
                            okType: 'danger',
                            cancelText: '取消',
                            onOk: () => handleDelete(link.id),
                          });
                        }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </section>
          );
        })
      )}

      {/* 添加链接弹窗 */}
      <Modal
        title="添加网站链接"
        open={addModalOpen}
        onOk={handleAdd}
        onCancel={() => {
          form.resetFields();
          setAddModalOpen(false);
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ category: categories[0]?.id }}>
          <Form.Item
            name="title"
            label="网站名称"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="例如：GitHub" />
          </Form.Item>
          <Form.Item
            name="url"
            label="网址"
            rules={[
              { required: true, message: '请输入网址' },
              { type: 'url', message: '请输入有效的 URL' },
            ]}
          >
            <Input placeholder="https://github.com" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="简短描述（选填）" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="选择分类"
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.icon} ${c.name}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

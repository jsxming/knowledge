import { useMemo } from 'react';
import { Table } from 'antd';
import type { TablePaginationConfig } from 'antd';
import type { EasyTableProps } from './types';
import styles from './index.module.less';

const DEFAULT_PAGE_SIZE = 20;

const defaultPagination: TablePaginationConfig = {
  pageSize: DEFAULT_PAGE_SIZE,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number, range: [number, number]) =>
    `共 ${total} 条，第 ${range[0]}-${range[1]} 条`,
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function EasyTable<T extends object = {}>({
  columns,
  dataSource,
  loading = false,
  emptyText = '暂无数据',
  pagination,
  size = 'middle',
  scroll,
  locale,
  rowKey,
  ...restProps
}: EasyTableProps<T>) {
  const mergedPagination = useMemo<TablePaginationConfig | false>(() => {
    // pagination === false 表示不分页
    if (pagination === false) {
      return false;
    }

    // 用户传了分页配置，合并默认值
    if (pagination && typeof pagination === 'object') {
      return {
        ...defaultPagination,
        ...pagination,
      };
    }

    // 使用默认分页
    return {
      ...defaultPagination,
    };
  }, [pagination]);

  const mergedScroll = useMemo(() => {
    return {
      x: 'max-content' as const,
      ...scroll,
    };
  }, [scroll]);

  // 自动处理 rowKey：如果未提供则使用 index 的字符串形式
  const mergedRowKey = rowKey ?? ((_record: T, index?: number) => String(index ?? 0));

  const mergedLocale = useMemo(() => {
    return {
      emptyText,
      ...locale,
    };
  }, [emptyText, locale]);

  return (
    <div className={styles.tableWrapper}>
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        size={size}
        pagination={mergedPagination}
        scroll={mergedScroll}
        locale={mergedLocale}
        rowKey={mergedRowKey}
        {...restProps}
      />
    </div>
  );
}

export default EasyTable;
export type { EasyTableProps };

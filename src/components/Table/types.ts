import type { TableProps } from 'antd';

/**
 * EasyTable 组件的 Props 类型
 * 基于 antd TableProps 扩展，提供更友好的默认值
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EasyTableProps<T extends object = {}>
  extends Omit<TableProps<T>, 'loading'> {
  /** 加载状态 */
  loading?: boolean;
  /**
   * 空状态提示文本
   * @default '暂无数据'
   */
  emptyText?: string;
}

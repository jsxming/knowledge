import { useState, useEffect } from 'react';
import { Card, Input, Button, Checkbox, Typography, Empty, Popconfirm } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { TodoItem } from '@/types';
import { getItem, setItem, generateId, formatDate } from '@/utils/storage';
import styles from './index.module.less';

const { Text } = Typography;

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    setTodos(getItem<TodoItem[]>('todos', []));
  }, []);

  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    setItem('todos', updatedTodos);
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoItem = {
      id: generateId(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    saveTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  const incompleteTodos = todos.filter((t) => !t.completed);

  return (
    <Card
      className="glass-card"
      title={
        <span className={styles.cardTitle}>
          <UnorderedListOutlined className={styles.listIcon} />
          待办事项
          <Text className={styles.subtitle}>
            ({incompleteTodos.length}项未完成)
          </Text>
        </span>
      }
      classNames={{ body: styles.cardBody }}
    >
      <div className={styles.inputWrapper}>
        <Input
          placeholder="添加待办事项..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="borderless"
          className={styles.todoInput}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addTodo}
          disabled={!newTodo.trim()}
        >
          添加
        </Button>
      </div>

      {todos.length === 0 ? (
        <Empty description="暂无待办事项" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className={styles.listContainer}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`${styles.todoItem} ${todo.completed ? styles.todoItemCompleted : ''}`}
            >
              <div className={styles.todoContent}>
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <div className={styles.todoTextWrapper}>
                  <Text
                    className={`${styles.todoText} ${todo.completed ? styles.todoTextDone : ''}`}
                  >
                    {todo.text}
                  </Text>
                  <br />
                  <Text className={styles.todoDate}>
                    {formatDate(todo.createdAt)}
                  </Text>
                </div>
              </div>
              <Popconfirm
                title="确定删除这条待办事项吗？"
                onConfirm={() => deleteTodo(todo.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Card, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './index.module.less';

const { Text } = Typography;

export default function CalendarWidget() {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const startOfMonth = currentTime.startOf('month');
  const endOfMonth = currentTime.endOf('month');
  const startDay = startOfMonth.day();
  const totalDays = endOfMonth.date();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const today = currentTime.date();
  const currentMonth = currentTime.month();
  const currentYear = currentTime.year();
  const now = dayjs();

  return (
    <Card
      className={`glass-card ${styles.card}`}
      classNames={{ body: styles.cardBody }}
    >
      <div className={styles.headerRow}>
        <Text strong className={styles.monthTitle}>
          <CalendarOutlined className={styles.calendarIcon} />
          {currentTime.format('YYYY年M月')}
        </Text>
        <Text className={styles.timeText}>
          <ClockCircleOutlined className={styles.clockIcon} />
          {currentTime.format('HH:mm:ss')}
        </Text>
      </div>

      <div className={styles.calendarGrid}>
        {weekDays.map((d) => (
          <div key={d} className={styles.weekday}>
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const isToday =
            day !== null &&
            day === today &&
            currentMonth === now.month() &&
            currentYear === now.year();

          const cellClass = day === null
            ? `${styles.dayCell} ${styles.emptyCell}`
            : isToday
              ? `${styles.dayCell} ${styles.todayCell}`
              : styles.dayCell;

          return (
            <div key={i} className={cellClass}>
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

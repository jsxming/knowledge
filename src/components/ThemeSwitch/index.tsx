import { Radio, type RadioChangeEvent } from 'antd';
import {
  ThunderboltOutlined,
  HeartOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeName } from '@/types';

const themeOptions: { value: ThemeName; label: string; icon: React.ReactNode }[] = [
  { value: 'tech', label: '科技', icon: <ThunderboltOutlined /> },
  { value: 'aesthetic', label: '唯美', icon: <HeartOutlined /> },
  { value: 'dark', label: '黑暗', icon: <MoonOutlined /> },
  { value: 'light', label: '浅色', icon: <SunOutlined /> },
];

export default function ThemeSwitch() {
  const { themeName, setThemeName } = useTheme();

  const handleChange = (e: RadioChangeEvent) => {
    setThemeName(e.target.value as ThemeName);
  };

  return (
    <Radio.Group
      value={themeName}
      onChange={handleChange}
      optionType="button"
      buttonStyle="solid"
      size="small"
    >
      {themeOptions.map((opt) => (
        <Radio.Button key={opt.value} value={opt.value}>
          {opt.icon}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
}

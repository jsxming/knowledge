import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { ConfigProvider, theme, type ThemeConfig } from 'antd';
import type { ThemeName } from '@/types';
import { getItem, setItem } from '@/utils/storage';

const THEME_STORAGE_KEY = 'theme';

interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'tech',
  setThemeName: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const themeConfigMap: Record<ThemeName, ThemeConfig> = {
  tech: {
    token: {
      colorPrimary: '#1677ff',
      colorLink: '#1677ff',
      borderRadius: 8,
    },
    algorithm: theme.defaultAlgorithm,
  },
  aesthetic: {
    token: {
      colorPrimary: '#c08ee5',
      colorLink: '#c08ee5',
      borderRadius: 12,
      colorBgContainer: '#fff5f9',
      colorBgLayout: '#fff0f5',
      colorBgElevated: '#ffffff',
    },
    algorithm: theme.defaultAlgorithm,
  },
  dark: {
    token: {
      colorPrimary: '#1677ff',
      colorLink: '#69b1ff',
      borderRadius: 8,
    },
    algorithm: theme.darkAlgorithm,
  },
  light: {
    token: {
      colorPrimary: '#1677ff',
      borderRadius: 8,
    },
    algorithm: theme.defaultAlgorithm,
  },
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    return getItem<ThemeName>(THEME_STORAGE_KEY, 'tech');
  });

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    setItem(THEME_STORAGE_KEY, name);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  const contextValue = useMemo(() => ({ themeName, setThemeName }), [themeName, setThemeName]);

  const antdConfig = useMemo(() => themeConfigMap[themeName], [themeName]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

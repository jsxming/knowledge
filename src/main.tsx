import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import App from './App';
import './styles/global.less';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/knowledge">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { SiteSettingsProvider } from '@/hooks/useSiteSettings';
import { SiteContentProvider } from '@/hooks/useSiteContent';
import { SiteLayoutProvider } from '@/hooks/useSiteLayout';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <SiteContentProvider>
            <SiteLayoutProvider>
              <App />
            </SiteLayoutProvider>
          </SiteContentProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </HelmetProvider>
);

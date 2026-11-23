import theme from '@/theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI로봇집게+ · AI코디니 연동',
  description: 'AI로봇집게+ USB 시리얼 연동 개발 프로젝트',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="ko">
      <body>
        {/* 스트리밍 SSR에서 MUI(Emotion) 스타일을 <head>로 수집한다 */}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

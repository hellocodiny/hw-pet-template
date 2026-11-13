import theme from '@/theme/theme'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Codiny Hw Iframe',
  description: 'codiny hw iframe',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
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
  )
}

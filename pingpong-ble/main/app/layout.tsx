import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { theme } from '@/theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { Suspense } from 'react'
export const metadata: Metadata = {
  title: 'Codiny Hw Iframe',
  description: 'codiny hw iframe',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense>{children}</Suspense>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

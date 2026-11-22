import ThemeRegistry from '@/theme/ThemeRegistry'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI로봇집게+ · AI코디니 연동',
  description: 'AI로봇집게+ USB 시리얼 연동 개발 프로젝트',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}

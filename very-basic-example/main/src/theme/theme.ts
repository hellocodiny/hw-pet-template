'use client'

// import { Roboto } from 'next/font/google'
import { createTheme } from '@mui/material/styles'

// const roboto = Roboto({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
// })

const theme = createTheme({
  // 색상을 CSS 변수로 내보내 SSR 직후 깜빡임과 런타임 재계산을 줄인다
  cssVariables: true,
  palette: {
    mode: 'light',
  },
  // typography: {
  //   fontFamily: roboto.style.fontFamily,
  // },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
})

export default theme

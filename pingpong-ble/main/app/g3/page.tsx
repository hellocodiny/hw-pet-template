'use client'

import { CommandRunnerG3 } from '@/hw/CommandRunnerG3'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <Box
        style={{
          padding: 0,
        }}
        sx={{
          pt: 2,
          bgcolor: '#fff',
        }}
      >
        <MainUi commandRunnerClass={CommandRunnerG3} cubeType="g3" logoImageUrl="G3.png" />
      </Box>
    </Suspense>
  )
}

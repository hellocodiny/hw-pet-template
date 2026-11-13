'use client'

import { CommandRunnerG1 } from '@/hw/CommandRunnerG1'
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
        <MainUi commandRunnerClass={CommandRunnerG1} cubeType="g1" logoImageUrl="G1.png" />
      </Box>
    </Suspense>
  )
}

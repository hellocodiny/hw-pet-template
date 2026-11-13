import { PetPanel } from '@/components/PetPanel'
import { Box } from '@mui/material'
import { Suspense } from 'react'

// 패널 높이(px): 로고 80 + 이름 32 + 미디어 아이콘 44 + 연결 버튼 40 + 여백(pt 16, mt 8 x 2)
const PANEL_MIN_HEIGHT = 228

// useSearchParams를 쓰는 클라이언트 서브트리만 Suspense로 감싼다.
// fallback은 레이아웃 이동을 막기 위해 패널 높이를 미리 확보한다.
export default function Page() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: PANEL_MIN_HEIGHT }} />}>
      <PetPanel />
    </Suspense>
  )
}

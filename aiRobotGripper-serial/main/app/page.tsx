'use client';
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { usePet } from '@repo/ui';
import { HW_ID, HW_NAME } from '@/constant';
import { CommandRunner } from '@/hw/CommandRunner';
import type { RobotStatus } from '@/hw/RobotController';

const names = ['상하', '좌우', '집게'];
const sensors = ['상하 가변저항', '좌우 가변저항', '집게 가변저항', '왼쪽 조도', '오른쪽 조도'];
// 값이 바뀌지 않는 환경 정보용 구독 함수
const subscribeNever = () => () => {};
const getSerialSupported = () => 'serial' in navigator && window.isSecureContext;
function ControlPage() {
  const { commandRunner: runner } = usePet(HW_ID, CommandRunner, useSearchParams());
  const [status, setStatus] = useState<RobotStatus | null>(null);
  const [error, setError] = useState('');
  // Web Serial 지원 여부. 서버 렌더링과 하이드레이션에서는 true로 시작하고 클라이언트에서 실제 값으로 갱신한다
  const supported = useSyncExternalStore(subscribeNever, getSerialSupported, () => true);
  const [which, setWhich] = useState(2);
  const [color, setColor] = useState('#ff6600');
  const [hz, setHz] = useState(440);
  useEffect(() => {
    if (!runner) return;
    // 첫 상태는 타이머 콜백에서 반영해 effect 안의 동기 setState를 피한다
    const first = setTimeout(() => setStatus(runner.getSnapshot()), 0);
    let pending: ReturnType<typeof setTimeout> | undefined;
    // Sensor streams run ~33Hz; render at most 10Hz, without delaying packet handling.
    const unsubscribe = runner.subscribe(() => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = undefined;
        setStatus(runner.getSnapshot());
      }, 100);
    });
    return () => {
      unsubscribe();
      clearTimeout(first);
      clearTimeout(pending);
    };
  }, [runner]);
  const run = (fn: () => Promise<unknown>) => {
    setError('');
    void fn().catch((e) => {
      setError(e instanceof Error ? e.message : String(e));
    });
  };
  const connected = status?.connection === 'connected';
  const connecting = status?.connection === 'connecting';
  const canControl = Boolean(connected && !status?.stopped);
  const setPixel = (off = false) => {
    if (!runner) return;
    const rgb = off ? [0, 0, 0] : [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    run(() => runner.pixel(which, rgb[0], rgb[1], rgb[2]));
  };
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, py: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <img alt="AI로봇집게" height={72} src="logo.png" width={72} />
        <Box>
          <Typography component="h1" variant="h5">
            {HW_NAME.ko}
          </Typography>
          <Typography color="text.secondary">
            AI코디니 · 3단계 USB 통신 시험 · 수신 복구 v2
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, my: 2 }}>
        <Chip
          color={connected ? 'success' : 'default'}
          label={connected ? '연결됨' : connecting ? '연결 확인 중' : '연결 안 됨'}
        />
        <Button
          disabled={!runner || connecting || connected || !supported}
          onClick={() => {
            if (runner) run(() => runner.connect());
          }}
          variant="contained"
        >
          USB 연결
        </Button>
        <Button
          disabled={!runner || (!connecting && !connected)}
          onClick={() => {
            if (runner) run(() => runner.disconnect());
          }}
          variant="outlined"
        >
          연결 해제
        </Button>
        <Button
          color="error"
          disabled={!connected}
          onClick={() => {
            if (runner) run(() => runner.stop());
          }}
          variant="contained"
        >
          정지
        </Button>
        <Button
          disabled={!connected || !status?.stopped}
          onClick={() => {
            if (runner) run(() => runner.start());
          }}
          variant="outlined"
        >
          제어 재개
        </Button>
      </Stack>
      {!supported && (
        <Alert severity="warning">
          PC용 Chrome/Edge에서 localhost 또는 HTTPS 주소로 접속하세요.
        </Alert>
      )}
      {Boolean(error || status?.error) && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error || status?.error}
        </Alert>
      )}
      <Alert severity="info">{status?.message || '화면을 준비하고 있습니다.'}</Alert>
      <Typography color="text.secondary" sx={{ my: 1 }} variant="body2">
        연결하면 세 관절의 목표각이 90°로 설정됩니다. 다른 로봇 제어 앱과 엔트리 하드웨어는
        종료하세요.
      </Typography>
      <Typography component="h2" sx={{ mt: 3 }} variant="h6">
        관절 목표각
      </Typography>
      <Typography color="text.secondary" variant="body2">
        표시 각도는 명령값입니다. 실제 관절의 측정 각도가 아닙니다.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mt: 2,
        }}
      >
        {names.map((name, i) => (
          <Box key={name}>
            <Typography>
              {name} · {status?.output.angles[i] ?? 90}°
            </Typography>
            <Slider
              aria-label={`${name} 각도`}
              disabled={!canControl}
              max={180}
              min={0}
              onChange={(_, v) => {
                if (runner) run(() => runner.servo(i + 1, v as number));
              }}
              value={status?.output.angles[i] ?? 90}
              valueLabelDisplay="auto"
            />
          </Box>
        ))}
      </Box>
      <Typography component="h2" sx={{ mt: 2, mb: 2 }} variant="h6">
        LED와 소리
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          disabled={!canControl}
          label="RGB LED"
          onChange={(e) => setWhich(Number(e.target.value))}
          select
          size="small"
          sx={{ minWidth: 130 }}
          value={which}
        >
          <MenuItem value={2}>전체</MenuItem>
          <MenuItem value={0}>1번</MenuItem>
          <MenuItem value={1}>2번</MenuItem>
        </TextField>
        <label>
          색상{' '}
          <input
            aria-label="LED 색상"
            disabled={!canControl}
            onChange={(e) => setColor(e.target.value)}
            type="color"
            value={color}
          />
        </label>
        <Button disabled={!canControl} onClick={() => setPixel()} variant="outlined">
          색 적용
        </Button>
        <Button disabled={!canControl} onClick={() => setPixel(true)}>
          LED 끄기
        </Button>
      </Stack>
      <Box sx={{ maxWidth: 400, mt: 3 }}>
        <Typography>
          파란 LED 밝기 · {Math.round(((status?.output.blue ?? 0) * 100) / 255)}%
        </Typography>
        <Slider
          aria-label="파란 LED 밝기"
          disabled={!canControl}
          onChange={(_, v) => {
            if (runner) run(() => runner.blue(Math.round((Number(v) * 255) / 100)));
          }}
          value={Math.round(((status?.output.blue ?? 0) * 100) / 255)}
          valueLabelDisplay="auto"
        />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <TextField
          disabled={!canControl}
          slotProps={{ htmlInput: { min: 0, max: 2040, step: 8 } }}
          label="부저 주파수 (Hz)"
          onChange={(e) => setHz(Number(e.target.value))}
          size="small"
          type="number"
          value={hz}
        />
        <Button
          disabled={!canControl}
          onClick={() => {
            if (runner) run(() => runner.tone(hz));
          }}
          variant="outlined"
        >
          소리 켜기
        </Button>
        <Button
          disabled={!canControl}
          onClick={() => {
            if (runner) run(() => runner.tone(0));
          }}
        >
          소리 끄기
        </Button>
      </Stack>
      <Typography component="h2" sx={{ mt: 3, mb: 2 }} variant="h6">
        센서값 · 0~1023 환산 표시
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' },
          gap: 1,
        }}
      >
        {sensors.map((name, i) => (
          <Box key={name} sx={{ border: '1px solid #d9e3eb', borderRadius: 2, p: 1.5 }}>
            <Typography variant="body2">{name}</Typography>
            <Typography variant="h5">
              {connected && status?.sensors ? status.sensors[i] : '—'}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              원시값 {connected && status?.raw ? status.raw[i] : '—'}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
        송신 {status?.txCount ?? 0}회 · 수신 {status?.rxCount ?? 0}회 · 115200bps · 송신 간격 30ms
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
        정지: LED·부저를 끄고 마지막 관절 목표각을 유지합니다. 이동 중인 관절은 목표각까지 움직일 수
        있습니다. 연결 해제 후에는 펌웨어에 따라 약 2초 뒤 수동 모드로 돌아갑니다.
      </Typography>
    </Box>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p>불러오는 중…</p>}>
      <ControlPage />
    </Suspense>
  );
}

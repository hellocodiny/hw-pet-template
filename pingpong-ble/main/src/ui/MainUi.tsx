'use client'

import { HW_ID, HW_NAME } from '@/constant'
import type { CubeType } from '@/types'
import type { HPetCommandRunnerClassType } from '@ktaicoder/hw-pet'
import { Box } from '@mui/material'
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui'
import React, { Suspense, useEffect, useState } from 'react'

const MEDIA_ICON = 'bluetooth.svg'

interface Props {
  cubeType: CubeType
  commandRunnerClass: HPetCommandRunnerClassType<any>
  logoImageUrl: string
}

export default function MainUi(props: Props) {
  const { commandRunnerClass, cubeType, logoImageUrl } = props
  const { commandRunner, connectionState, pet } = usePet(HW_ID, commandRunnerClass)

  /**
   * 그룹번호 설정
   */
  const [selectGroupNumber, setSelectGroupNumber] = useState('00') // 기본값은 두 자리의 0으로 설정
  const [checked, setChecked] = useState(false)

  /**
   * 이미지 변경
   */
  const [connectChangeImage, setLogoImageUrl] = useState(logoImageUrl) // logoImageUrl 상태 추가

  // // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.groupNumber = selectGroupNumber
    runner.connect()
  }

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner
    if (!runner) {
      return
    }
    runner.disconnect()
  }

  const handleChangeNumber0 = (e) => {
    if (!selectGroupNumber) {
      setSelectGroupNumber('00')
      return
    }
    const selectedValue = e.target.value
    setSelectGroupNumber(selectedValue + selectGroupNumber.charAt(1)) // 첫 번째 자리만 업데이트
  }

  const handleChangeNumber1 = (e) => {
    if (!selectGroupNumber) {
      setSelectGroupNumber('00')
      return
    }
    const selectedValue = e.target.value
    setSelectGroupNumber(selectGroupNumber.charAt(0) + selectedValue) // 두 번째 자리만 업데이트
  }

  useEffect(() => {
    if (!selectGroupNumber) return
    if (selectGroupNumber.charAt(0) == selectGroupNumber.charAt(1)) {
      if (selectGroupNumber.charAt(0) != '0') {
        setChecked(true)
        setSelectGroupNumber('00')
      }
    }
  }, [selectGroupNumber])

  const handleCloseModal = () => {
    setChecked(false)
  }

  useEffect(() => {
    if (!commandRunner) return // commandRunner 객체가 초기화되지 않았으면 아무 것도 하지 않음

    const handleImageChange = (newSrc) => {
      setLogoImageUrl(newSrc)
    }

    commandRunner.uiEvents.on('connectChangeImage', handleImageChange)

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
    return () => {
      commandRunner.uiEvents.off('connectChangeImage', handleImageChange)
    }
  }, [commandRunner]) // commandRunner 객체가 변경될 때마다 이 코드를 실행

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
        <div>
          {checked && (
            <div
              onClick={handleCloseModal}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                padding: '5px',
                borderRadius: '10px',
                zIndex: '9999',
                width: '200px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                }}
              >
                동일한 앞뒤 번호는 설정할 수 없습니다.
              </p>
            </div>
          )}
          <h4
            style={{
              textAlign: 'center',
              margin: 0,
            }}
          >
            그룹번호 설정
          </h4>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <select
              onChange={handleChangeNumber0}
              style={{
                border: 'none',
                height: '30px',
                fontSize: '25px',
                background: '#ffd558',
                borderRadius: '8px',
              }}
              value={selectGroupNumber?.charAt(0) ?? '0'}
            >
              {[...Array(8).keys()].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
            <select
              onChange={handleChangeNumber1}
              style={{
                border: 'none',
                height: '30px',
                fontSize: '25px',
                background: '#ffd558',
                borderRadius: '8px',
              }}
              value={selectGroupNumber?.charAt(1) ?? '0'}
            >
              {[...Array(8).keys()].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>
        </div>
        <HardwareImageBox src={connectChangeImage} />
        <HardwareNameBox title={HW_NAME.en} />
        <MediaIconBox mediaIcon={MEDIA_ICON} />
        <ConnectButton
          connectionState={connectionState}
          onClickConnectBtn={handleClickConnectBtn}
          onClickDisconnectBtn={handleClickDisconnectBtn}
        />
      </Box>
    </Suspense>
  )
}

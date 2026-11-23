'use client';

import type {
  ConnectionState,
  HPetCommandRunnerClassType,
  IHPetCommandRunner,
} from '@ktaicoder/hw-pet';
import { HPet, HPetNotifyEventKeys } from '@ktaicoder/hw-pet';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

interface Result<T> {
  pet: HPet | undefined;
  commandRunner: T | undefined;
  connectionState: ConnectionState;
}

/** effect에서 만든 외부 객체를 렌더링에 노출하기 위한 최소 저장소 */
function createInstanceStore<T>() {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function usePet<T extends IHPetCommandRunner, C extends HPetCommandRunnerClassType<T>>(
  hwId: string,
  commandRunnerClass: C,
  searchParams: ReadonlyURLSearchParams,
): Result<InstanceType<C>> {
  const iframeToken = useMemo(
    () => getIframeToken(searchParams.get('iframeToken')),
    [searchParams],
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [commandRunner, setCommandRunner] = useState<InstanceType<C>>();
  // HPet은 effect에서 시작해야 하므로 저장소로 노출한다(effect 안 setState 방지)
  const [petStore] = useState(() => createInstanceStore<HPet>());
  const petInstance = useSyncExternalStore(petStore.subscribe, petStore.get, () => undefined);

  useEffect(() => {
    const pet = new HPet({
      iframeToken,
      hwId,
      commandRunnerClass,
    });
    pet.notifyEvents.on(HPetNotifyEventKeys.CommandRunner.stateChanged, (data) => {
      const { state, commandRunner } = data;
      if (state === 'started') {
        setCommandRunner(commandRunner as InstanceType<C>);
      } else {
        setCommandRunner(undefined);
      }
    });
    pet.notifyEvents.on(HPetNotifyEventKeys.connectionStateChanged, setConnectionState);

    pet.start();
    petStore.set(pet);
    return () => {
      // all event listeners will be automatically removed
      pet.stop();
      setCommandRunner(undefined);
    };
  }, [hwId, iframeToken, commandRunnerClass, petStore]);

  return useMemo(
    () => ({ pet: petInstance, commandRunner, connectionState }),
    [petInstance, commandRunner, connectionState],
  );
}

export function getIframeToken(iframeToken: string | null): string {
  if (iframeToken) {
    return iframeToken;
  }

  console.log('iframeToken is empty. use unknown', iframeToken);
  return 'unknown';
}

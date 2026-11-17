import { useCallback, useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: string | undefined
}

// Carrega dados assíncronos. Mantém o dado anterior visível durante uma recarga.
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined })
  const [tick, setTick] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: undefined }))
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: undefined })
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar os dados.' }))
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}

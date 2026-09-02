import { useEffect, useState } from 'react'
import type { RankingDocument } from '../domain/repository'

interface RankingDataState {
  data: RankingDocument | null
  loading: boolean
  error: string | null
}

export function useRankingData(): RankingDataState {
  const [state, setState] = useState<RankingDataState>({
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${import.meta.env.BASE_URL}data/current.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`排行榜讀取失敗 (${response.status})`)
        return response.json() as Promise<RankingDocument>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : '排行榜讀取失敗'
        })
      })

    return () => controller.abort()
  }, [])

  return state
}

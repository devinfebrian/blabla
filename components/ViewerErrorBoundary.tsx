'use client'

import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; onRetry: () => void }
type State = { hasError: boolean }

export class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="viewer-error"
          className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900"
        >
          <p className="text-sm text-zinc-500">Gagal memuat model 3D.</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false })
              this.props.onRetry()
            }}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Coba lagi
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

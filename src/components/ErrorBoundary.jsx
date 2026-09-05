import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
          <h2 className="text-[20px] font-bold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-[14px] text-on-surface-variant mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

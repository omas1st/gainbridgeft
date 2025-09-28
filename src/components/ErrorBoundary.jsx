import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // store stack trace for display
    this.setState({ info })
    // you may also log this to remote logging here
    // console.error('Caught by ErrorBoundary', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null })
    // attempt a full reload of the app
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const { error, info } = this.state
    return (
      <div style={{
        minHeight: '100vh',
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: '#fff5f5',
        color: '#7f1d1d',
        padding: 24
      }}>
        <h2 style={{marginTop:0}}>Something went wrong</h2>
        <div style={{marginTop:8, marginBottom:16, color:'#b91c1c'}}>
          <strong>{error?.message || String(error)}</strong>
        </div>
        {info?.componentStack && (
          <details style={{whiteSpace:'pre-wrap', background:'#fff', padding:12, border:'1px solid #fca5a5', borderRadius:6}}>
            <summary style={{cursor:'pointer'}}>Component stack (click to expand)</summary>
            <pre style={{marginTop:8, fontSize:12}}>{info.componentStack}</pre>
          </details>
        )}
        <div style={{marginTop:16}}>
          <button onClick={this.handleRetry} style={{
            background:'#ef4444', color:'#fff', border:'none', padding:'8px 12px', borderRadius:6, cursor:'pointer'
          }}>Reload page</button>
        </div>
        <div style={{marginTop:18, color:'#6b7280', fontSize:13}}>
          If you want help fixing this, paste the error message and the component stack shown above here and I will provide an immediate patch.
        </div>
      </div>
    )
  }
}

import React from 'react';
import { isChunkLoadError, reloadForChunkError } from '../../utils/chunkReloader';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, isChunkError: false };
    }

    static getDerivedStateFromError(error) {
        // React.lazy() failures arrive here as render-phase errors because
        // React swallows the underlying Promise rejection. Mark the chunk
        // case so render() can show a neutral fallback while reload fires.
        return { hasError: true, isChunkError: isChunkLoadError(error) };
    }

    componentDidCatch(error, errorInfo) {
        if (isChunkLoadError(error)) {
            reloadForChunkError();
            return;
        }
        this.setState({ error, errorInfo });
        if (import.meta.env.DEV) {
            console.error("Uncaught error:", error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Stale-tab self-heal: reload is in flight (or capped). Render a
            // blank cream surface instead of the Hebrew error UI to avoid a
            // flash of "משהו השתבש" on every post-deploy mobile recovery.
            if (this.state.isChunkError) {
                return <div style={{ minHeight: '100vh', background: '#FDFBF7' }} />;
            }
            const isDev = import.meta.env.DEV;
            return (
                <div
                    dir="rtl"
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        fontFamily: 'Heebo, sans-serif',
                        textAlign: 'center',
                        background: '#FDFBF7',
                        color: '#2D211E'
                    }}
                >
                    <div style={{ maxWidth: 520 }}>
                        <h1 style={{ color: '#B91C1C', fontSize: 32, marginBottom: 16, fontWeight: 900 }}>
                            משהו השתבש
                        </h1>
                        <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 24 }}>
                            נתקלנו בתקלה זמנית. אנא רעננו את העמוד או חזרו לדף הבית.
                            אם הבעיה ממשיכה — נשמח לשמוע מכם.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    background: '#B91C1C',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: 'pointer'
                                }}
                            >
                                רענון העמוד
                            </button>
                            <a
                                href="/"
                                style={{
                                    background: 'white',
                                    color: '#380909',
                                    border: '1px solid #D4AF37',
                                    padding: '12px 24px',
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    fontSize: 16,
                                    textDecoration: 'none'
                                }}
                            >
                                חזרה לעמוד הבית
                            </a>
                        </div>

                        {isDev && this.state.error && (
                            <pre
                                style={{
                                    marginTop: 32,
                                    padding: 16,
                                    background: '#f8f9fa',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 300,
                                    fontSize: 12
                                }}
                            >
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

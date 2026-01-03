import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Configuration Error
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    The application failed to start due to missing configuration.
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                                        {this.state.error.message}
                                    </pre>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h2 className="font-semibold text-blue-900 mb-2">
                                        Quick Fix:
                                    </h2>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                        <li>Check your <code className="bg-blue-100 px-1 rounded">.env</code> file in the project root</li>
                                        <li>Make sure it contains both <code className="bg-blue-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-blue-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                                        <li>Restart the development server after updating the .env file</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

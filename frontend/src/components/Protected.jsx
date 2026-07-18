import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Protected({ children }) {
    const { loading, user } = useAuth()

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>
    if (!user) return <Navigate to="/auth" replace />
    return children
}

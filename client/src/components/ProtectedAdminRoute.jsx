import { Navigate } from 'react-router-dom'
import { adminAuthService } from '../services/adminAuthService'

export default function ProtectedAdminRoute({ children }) {
    const isAdminLoggedIn = adminAuthService.isAdminLoggedIn()

    if (!isAdminLoggedIn) {
        return <Navigate to="/admin/login" replace />
    }

    return children
}

import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

const NavigateToHome = () => {
    const { qrCode } = useParams()
    if (qrCode) {
        sessionStorage.setItem('scanned_code', qrCode.toUpperCase());
    }
    return <Navigate to="/" replace state={{ autoOpenReward: true }} />
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/p/:qrCode" element={<NavigateToHome />} />

                    {/* Admin routes remain separate for security/scope */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard/*" element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    } />
                </Routes>
            </Router>
            <Toaster position="top-center" />
        </AuthProvider>
    )
}

export default App

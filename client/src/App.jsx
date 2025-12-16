import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import RewardsPage from './pages/RewardsPage'
import ReelsPage from './pages/ReelsPage'
import UserDashboard from './pages/UserDashboard'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/reels" element={<ReelsPage />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
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

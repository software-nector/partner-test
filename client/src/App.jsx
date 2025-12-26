import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import ProductDetails from './pages/ProductDetails'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/p/:qrCode" element={<ProductDetails />} />

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

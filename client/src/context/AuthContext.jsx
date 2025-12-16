import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (token && savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (phone, coupon) => {
        try {
            const response = await authService.login(phone, coupon)
            const { token, user: userData } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)

            toast.success('Login successful!')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            return { success: false, error: message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        toast.success('Logged out successfully')
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

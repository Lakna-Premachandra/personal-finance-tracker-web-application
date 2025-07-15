// components/ProtectedRoute.tsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router' // or 'next/navigation' for app router
import { initializeAuth } from '@/store/slices/authSlice'
import { RechartsRootState } from 'recharts/types/state/store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { isAuthenticated, token } = useSelector((state: RechartsRootState) => state.auth)

  useEffect(() => {
    // Initialize auth state from sessionStorage on component mount
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    // Check authentication after state is initialized
    if (!isAuthenticated && !token) {
      router.push('/login')
    }
  }, [isAuthenticated, token, router])

  // Show loading or return null while redirecting
  if (!isAuthenticated) {
    return <div>Redirecting to login...</div> // or your loading component
  }

  return <>{children}</>
}

export default ProtectedRoute
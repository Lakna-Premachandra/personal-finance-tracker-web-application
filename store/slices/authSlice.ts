// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  user: {
    id: number
    username: string
    email: string
    type: 'Young-Adult' | 'Student'
  } | null
  isAuthenticated: boolean
  isInitialized: boolean
}

// Always start with a clean state for SSR compatibility
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{
      token: string
      user: {
        id: number
        username: string
        email: string
        type: 'Young-Adult' | 'Student'
      }
    }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isInitialized = true
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', action.payload.token)
        sessionStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.isInitialized = true
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('token')
        const user = sessionStorage.getItem('user')
        
        if (token && user) {
          try {
            state.token = token
            state.user = JSON.parse(user)
            state.isAuthenticated = true
          } catch (error) {
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
          }
        }
      }
      state.isInitialized = true
    },
  },
})

export const { loginSuccess, logout, initializeAuth } = authSlice.actions
export default authSlice.reducer
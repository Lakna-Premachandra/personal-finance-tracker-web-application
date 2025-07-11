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
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
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
      // Also store in localStorage for persistence
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    initializeAuth: (state) => {
      // Check if token exists in localStorage on app initialization
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        state.token = token
        state.user = JSON.parse(user)
        state.isAuthenticated = true
      }
    },
  },
})

export const { loginSuccess, logout, initializeAuth } = authSlice.actions
export default authSlice.reducer
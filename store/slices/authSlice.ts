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
      // Use sessionStorage instead of localStorage
      sessionStorage.setItem('token', action.payload.token)
      sessionStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    },
    initializeAuth: (state) => {
      // Check if token exists in sessionStorage on app initialization
      const token = sessionStorage.getItem('token')
      const user = sessionStorage.getItem('user')
      
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
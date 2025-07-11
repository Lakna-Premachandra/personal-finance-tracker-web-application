// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { api } from '@/services/baseApi'

export const store = configureStore({
  reducer: {
    auth: authReducer, // ← Make sure this line exists
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})
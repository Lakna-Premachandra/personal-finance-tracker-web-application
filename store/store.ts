
// store/store.ts (updated)
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { api } from '@/services/baseApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
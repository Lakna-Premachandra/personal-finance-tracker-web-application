import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/user.types"
import { api } from "../baseApi"

const controller = 'auth'

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        loginUser: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: `${controller}/login`,
                method: 'POST',
                body,
            }),
        }),
        registerUser: builder.mutation<{ success: boolean; message: string }, RegisterRequest>({
            query: (body) => ({
                url: `${controller}/register`,
                method: 'POST',
                body,
            }),
        }),
    }),
    overrideExisting: false,
})

export const { useLoginUserMutation, useRegisterUserMutation } = authApi

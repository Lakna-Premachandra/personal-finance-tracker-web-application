// services/registerController.ts

import { api } from "../baseApi"

export const registerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (body) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useRegisterUserMutation } = registerApi

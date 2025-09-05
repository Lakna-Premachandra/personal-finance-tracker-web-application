import { api } from "../baseApi"

const controller = 'profile'

// Request/Response Interfaces
export interface Profile {
    id: number
    username: string
    email: string
    dateOfBirth: string
    address: string
    age: number
    phoneNo: string
    type: 'Student' | 'Young-Adult'
    profilePicture: string | null  | File // Allow string, File, or undefined for profile picture
    guardianContactNo: string
    employmentStatus: string
    updatedDate: string
}

export interface ProfileResponse {
    success: boolean
    data: Profile
}

export interface UpdateProfileRequest {
    username?: string
    email?: string
    dateOfBirth?: string
    address?: string
    phoneNo?: string
    profilePicture?: string | File | null // Allow string or File for profile picture
    guardianContactNo?: string | null
    employmentStatus?: string | null
    type?: 'Student' | 'Young-Adult'
}

export interface CheckAgeTransitionRequest {
    dateOfBirth: string
}

export interface AgeTransitionResponse {
    success: boolean
    data: {
        requiresTypeChange: boolean
        currentAge: number
        newUserType: string
        message: string
    }
}

export interface CheckAgeTransitionByIdResponse {
    requiresTypeChange: boolean
    currentAge: number
    newUserType: string
    message: string
}

export interface UpdateProfileResponse {
    success: boolean
    message: string
    ageTransition?: boolean
    newAge?: number
    requiresDecision?: boolean
    profilePicture?: string | File | null
    
}

export interface DeleteProfileResponse {
    success: boolean
    message: string
}

// RTK Query API slice
export const profileApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/profile/:id
        getProfileById: builder.query<ProfileResponse, number>({
            query: (id) => ({
                url: `${controller}/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Profile', id },],
        }),

        // POST /api/profile/:id/check-age-transition
        checkAgeTransition: builder.mutation<AgeTransitionResponse, { id: number; data: CheckAgeTransitionRequest }>({
            query: ({ id, data }) => ({
                url: `${controller}/${id}/check-age-transition`,
                method: 'POST',
                body: data,
            }),
        }),

        // POST /api/profile/:id (check age transition by ID)
        checkAgeTransitionById: builder.mutation<CheckAgeTransitionByIdResponse, { id: number; data: CheckAgeTransitionRequest }>({
            query: ({ id, data }) => ({
                url: `${controller}/${id}`,
                method: 'POST',
                body: data,
            }),
        }),

        // PUT /api/profile/:id
        updateProfile: builder.mutation<UpdateProfileResponse, { id: number; data: UpdateProfileRequest }>({
            query: ({ id, data }) => {
                const formData = new FormData()
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value as string)
                    }
                })

                return {
                    url: `${controller}/${id}`,
                    method: 'PUT',
                    body: formData,
                }
            },
            invalidatesTags: (result, error, { id }) => [{ type: 'Profile', id },'CronCheck','CronStatus'],
        }),


        // DELETE /api/profile/:id
        deleteProfile: builder.mutation<DeleteProfileResponse, number>({
            query: (id) => ({
                url: `${controller}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Profile', id }],
        }),
    }),
    overrideExisting: false,
})

// Export hooks for usage in functional components
export const {
    useGetProfileByIdQuery,
    useCheckAgeTransitionMutation,
    useCheckAgeTransitionByIdMutation,
    useUpdateProfileMutation,
    useDeleteProfileMutation,
} = profileApi

// Export endpoints for usage in non-component contexts
export const {
    getProfileById,
    checkAgeTransition,
    checkAgeTransitionById,
    updateProfile,
    deleteProfile,
} = profileApi.endpoints
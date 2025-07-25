import { api } from "../baseApi"

// Updated category interface based on your API response
export interface Category {
    Category_ID: number;
    User_ID: number | null;
    Name: string;
    Type: 'Income' | 'Expense';
    Is_Default: boolean;
    Created_Date: string;
    Updated_Date: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
}

// User type enum for clarity
export type UserType = 'Student' | 'Young-Adult';

const controller = 'categories'

export const categoryApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<CategoriesResponse, void>({
            query: () => ({
                url: `${controller}`,
                method: 'GET',
            }),
            providesTags: ['Category'],
        }),
        getCategoriesByType: builder.query<CategoriesResponse, 'Income' | 'Expense'>({
            query: (type) => ({
                url: `${controller}?type=${type}`,
                method: 'GET',
            }),
            providesTags: ['Category'],
        }),
        // NEW: Get categories filtered by type and user type
        getCategoriesByTypeAndUserType: builder.query<
            CategoriesResponse,
            { type: 'Income' | 'Expense'; userType: UserType }
        >({
            query: ({ type, userType }) => {
                const params = new URLSearchParams();
                params.append('type', type);

                // For students, only get default categories (Is_Default = true)
                // For young adults, get both default and custom categories
                if (userType === 'Student') {
                    params.append('is_default', 'true');
                }

                return {
                    url: `${controller}?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Category'],
            // Transform response to filter on client side as backup
            transformResponse: (response: CategoriesResponse, meta, arg) => {
                if (arg.userType === 'Student') {
                    // For students, only return default categories
                    return {
                        ...response,
                        data: response.data.filter(category => category.Is_Default === true)
                    };
                } else {
                    // For young adults, return all categories (default + custom)
                    return response;
                }
            },
        }),
        // Only available for young adults (is_default will always be false for custom categories)
        addCategory: builder.mutation<
            { success: boolean; message: string; data: { categoryId: number } },
            { name: string; type: 'Income' | 'Expense' }
        >({
            query: ({ name, type }) => {
                // Get the token from localStorage
                const token = sessionStorage.getItem('token');

                return {
                    url: `${controller}`,
                    method: 'POST',
                    body: {
                        name,
                        type,
                    },
                    headers: {
                        // Pass the JWT token in Authorization header
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                };
            },
            invalidatesTags: ['Category'],
        }),



        // Only available for young adults (for editing their custom categories)
        updateCategory: builder.mutation<
            { success: boolean; message: string },
            { id: number; name: string; type: 'Income' | 'Expense'; userType: UserType }
        >({
            query: ({ id, name, type, userType }) => ({
                url: `${controller}/${id}`,
                method: 'PUT',
                body: {
                    name,
                    type,
                    // Custom categories remain non-default
                    is_default: false,
                    user_type: userType
                },
                headers: {
                    'X-User-Type': userType,
                }
            }),
            invalidatesTags: ['Category'],
        }),
        // Only available for young adults (for deleting their custom categories)
        deleteCategory: builder.mutation<
            { success: boolean; message: string },
            { id: number; userType: UserType }
        >({
            query: ({ id, userType }) => ({
                url: `${controller}/${id}`,
                method: 'DELETE',
                headers: {
                    'X-User-Type': userType,
                }
            }),
            invalidatesTags: ['Category','Transaction'],
        }),
        // Get categories filtered by default status
        getCategoriesByDefault: builder.query<CategoriesResponse, { isDefault: boolean; type?: 'Income' | 'Expense' }>({
            query: ({ isDefault, type }) => {
                const params = new URLSearchParams();
                params.append('is_default', isDefault.toString());
                if (type) params.append('type', type);

                return {
                    url: `${controller}?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Category'],
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetCategoriesQuery,
    useGetCategoriesByTypeQuery,
    useGetCategoriesByTypeAndUserTypeQuery, // NEW hook
    useGetCategoriesByDefaultQuery,
    useAddCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} = categoryApi
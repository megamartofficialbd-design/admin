import { baseApi } from '@/redux/api/baseApi'
import { ICategory } from '@/types/Category'

const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getAllCategories: builder.query<ICategory[], void>({
      query: () => ({ url: '/category', method: 'GET' }),
      transformResponse: (response: { data: ICategory[] }) =>
        response.data.map(cat => ({ ...cat, isFeatured: cat.isFeatured ?? false })),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
            { type: 'Category' as const, id: 'LIST' },
          ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    // Get all sub-categories
    getAllSubCategories: builder.query<ICategory[], void>({
      query: () => ({ url: '/category/sub-categories/all', method: 'GET' }),
      transformResponse: (response: { data: ICategory[] }) =>
        response.data.map(cat => ({ ...cat, isFeatured: cat.isFeatured ?? false })),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'SubCategory' as const, id: _id })),
            { type: 'SubCategory' as const, id: 'LIST' },
          ]
          : [{ type: 'SubCategory' as const, id: 'LIST' }],
    }),

    // Create a category
    createCategory: builder.mutation<ICategory, Partial<ICategory>>({
      query: (newCategory) => ({
        url: '/category/create-category',
        method: 'POST',
        body: newCategory,
      }),
      transformResponse: (response: { data: ICategory }) => response.data,
      invalidatesTags: [{ type: 'Category', id: 'LIST' }, { type: 'SubCategory', id: 'LIST' }],
    }),

    // Edit category (used for toggling featured ON/OFF)
    editCategory: builder.mutation<ICategory, { id: string; updateDetails: any }>({
      query: ({ id, updateDetails }) => ({
        url: `/category/edit-category/${id}`,
        method: 'PATCH',
        body: updateDetails,
      }),
      transformResponse: (response: { data: ICategory }) => response.data,
      invalidatesTags: (result, error, arg) => [
        { type: 'Category', id: arg.id },
        { type: 'Category', id: 'LIST' },
        { type: 'SubCategory', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAllCategoriesQuery,
  useGetAllSubCategoriesQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
} = categoriesApi

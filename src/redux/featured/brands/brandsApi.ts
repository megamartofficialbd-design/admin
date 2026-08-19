import { baseApi } from "@/redux/api/baseApi";
import { IBrand } from "@/types/brands";
import { RootState } from "@/redux/store";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

const brandsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET - All brands
    getAllBrands: builder.query<IBrand[], void>({
      query: () => ({
        url: "/brand",
        method: "GET",
      }),
      transformResponse: (response: { data: IBrand[] }) => response.data,
      providesTags: ["Brand"],
    }),

    // GET - Single brand by ID
    getSingleBrand: builder.query<IBrand, string>({
      query: (id) => ({
        url: `/brand/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: IBrand }) => response.data,
      providesTags: ["Brand"],
    }),

    // POST - Create brand with image
    createBrand: builder.mutation<IBrand, FormData>({
      queryFn: async (formData, { getState }) => {
        try {
          const state = getState() as RootState;
          const token = state.auth?.token || "";

          console.log("[BRAND_API] Creating brand with token:", token);

          const response = await fetch(`${baseURL}/brand/create-brand`, {
            method: "POST",
            body: formData,
            headers: {
              authorization: token ? `${token}` : "",
              // Don't set Content-Type - let browser handle FormData
            },
            credentials: "include",
          });

          console.log("[BRAND_API] Response status:", response.status);
          
          const data = await response.json();
          console.log("[BRAND_API] Response data:", data);

          if (!response.ok) {
            console.error("[BRAND_API] Error response:", data);
            return { error: data.message || "Failed to create brand" };
          }

          console.log("[BRAND_API] Success, returning data:", data.data);
          return { data: data.data };
        } catch (error: any) {
          console.error("[BRAND_API] Catch error:", error);
          return { error: error.message || "Network error" };
        }
      },
      invalidatesTags: ["Brand"],
    }),

    // PATCH - Update brand with optional image
    updateBrand: builder.mutation<IBrand, { id: string; formData: FormData }>({
      queryFn: async ({ id, formData }, { getState }) => {
        try {
          const state = getState() as RootState;
          const token = state.auth?.token || "";

          const response = await fetch(`${baseURL}/brand/update-brand/${id}`, {
            method: "PATCH",
            body: formData,
            headers: {
              authorization: token ? `${token}` : "",
            },
            credentials: "include",
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: data.message || "Failed to update brand" };
          }

          return { data: data.data };
        } catch (error: any) {
          console.error("Update brand error:", error);
          return { error: error.message || "Network error" };
        }
      },
      invalidatesTags: ["Brand"],
    }),

    // DELETE - Delete brand
    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({
        url: `/brand/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useGetSingleBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;

import { baseApi } from '@/redux/api/baseApi';
import { IVendor } from '@/types/vendor';

const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new seller
    createVendor: builder.mutation<IVendor, Partial<IVendor>>({
      query: (data) => ({
        url: '/seller/create-seller',
        method: 'POST',
        body: data,
      }),
    }),

    // Get all sellers
    getVendors: builder.query<IVendor[], void>({
      query: () => ({
        url: '/seller',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; message: string; data: IVendor[] }) =>
        response.data,
    }),

    // Get a single seller by ID
    getVendorById: builder.query<any , string>({
      query: (id) => ({
        url: `/seller/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; message: string; data: IVendor }) =>
        response.data,
    }),
    getVendorByUserId: builder.query<any , string>({
      query: (id) => ({
        url: `/seller/user/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; message: string; data: IVendor }) =>
        response.data,
    }),
    updateVendorStatus: builder.mutation<IVendor, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/seller/status-update/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: { success: boolean; message: string; data: IVendor }) =>
        response.data,
    }),
  }),
});

export const {
  useCreateVendorMutation,
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useGetVendorByUserIdQuery,
  useUpdateVendorStatusMutation,
} = vendorApi;

// Seller aliases
export const useCreateSellerMutation = useCreateVendorMutation;
export const useGetSellersQuery = useGetVendorsQuery;
export const useGetSellerByIdQuery = useGetVendorByIdQuery;
export const useGetSellerByUserIdQuery = useGetVendorByUserIdQuery;
export const useUpdateSellerStatusMutation = useUpdateVendorStatusMutation;
export default vendorApi;

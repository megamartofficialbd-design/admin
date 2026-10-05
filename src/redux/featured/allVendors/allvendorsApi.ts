import { baseApi } from "@/redux/api/baseApi";

export interface Seller {
  _id: string;
  name: string;
  contactEmail: string;
  phone: string;
  status: string;
  createdAt: string;
  products: number;
  sales: string;
}

export type Vendor = Seller;

const sellerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSellers: builder.query<Seller[], void>({
      query: () => ({
        url: '/seller',
        method: 'GET',
      }),
      transformResponse: (response: { data: Seller[] }) => response.data,
    }),
    getAllVendors: builder.query<Seller[], void>({
      query: () => ({
        url: '/seller',
        method: 'GET',
      }),
      transformResponse: (response: { data: Seller[] }) => response.data,
    }),
  }),
});

export const { useGetAllSellersQuery, useGetAllVendorsQuery } = sellerApi;
export default sellerApi;
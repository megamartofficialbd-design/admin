'use client';

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IProduct } from "@/types/Product"
import { Package, Edit2 } from "lucide-react"
import Link from "next/link";
import UpdateStock from "../inventory/UpdateStock";

interface Props {
  products: IProduct[];
  isLoading: boolean;
  refetch: any;
  InventoryStatusRefetch: any
}

const getStockStatus = (stock: number) => {
  if (stock === 0) return { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Out of Stock" };
  if (stock < 10) return { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", label: "Low Stock" };
  return { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "In Stock" };
};

const ProductTable = ({
  products,
  isLoading,
  refetch,
  InventoryStatusRefetch,
}: Props) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <Package className="w-6 h-6 text-slate-400 animate-pulse" />
        </div>
        <p className="text-slate-600">Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium mb-2">No products found</p>
        <p className="text-slate-500 text-sm">Create your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">Product</th>
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">SKU</th>
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">Stock</th>
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">Status</th>
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">Price</th>
            <th className="text-left py-4 px-4 font-semibold text-slate-900 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const stock = product.productInfo?.quantity || 0;
            const stockStatus = getStockStatus(stock);
            const productName = product.description?.name || "Unknown Product";
            const productSku = product.productInfo?.sku || "N/A";
            const productPrice = product.productInfo?.price || "0.00";

            return (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{productName}</p>
                      <p className="text-xs text-slate-500">Product</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono">
                    {productSku}
                  </code>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm font-semibold text-slate-900">{stock} units</div>
                </td>
                <td className="py-4 px-4">
                  <Badge className={`${stockStatus.bg} ${stockStatus.text} flex items-center gap-1 w-fit`}>
                    <div className={`w-2 h-2 rounded-full ${stockStatus.dot}`} />
                    {stockStatus.label}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm font-semibold text-slate-900">
                    ${typeof productPrice === 'number' ? productPrice.toFixed(2) : parseFloat(productPrice as string).toFixed(2)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/edit-product/${product._id}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <UpdateStock
                      Productdata={product}
                      refetch={refetch}
                      InventoryStatusRefetch={InventoryStatusRefetch}
                    >
                      Restock
                    </UpdateStock>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable

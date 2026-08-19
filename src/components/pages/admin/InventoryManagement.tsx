"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertCircle, Package, TrendingUp, DollarSign } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectProducts, setProducts } from "@/redux/featured/products/productSlice";
import { IProduct } from "@/types/Product";
import { useGetAllProductsQuery, useProductInventoryQuery } from "@/redux/featured/products/productsApi";
import Link from "next/link";
import AttributeManagementSkeleton from "../loadings/AttributeManagementSkeleton";
import ProductTable from "@/components/inventory-management/ProductTable";

export interface IInventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStock: number;
  totalValue: number;
}

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, refetch } = useGetAllProductsQuery({ searchTerm });
  const { data: inventoryStats, isLoading: LoadingInventory, refetch: refetchInventory } = useProductInventoryQuery({});
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);

  useEffect(() => {
    if (data) {
      dispatch(setProducts(data as IProduct[]))
    }
  }, [data, dispatch]);

  const stats = useMemo(() => {
    if (!inventoryStats) {
      return [
        {
          title: "Total Products",
          value: "0",
          subtitle: "Active products",
          icon: Package,
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          title: "Total Stock",
          value: "0",
          subtitle: "Units in stock",
          icon: TrendingUp,
          color: "from-emerald-500 to-emerald-600",
          bgColor: "bg-emerald-50",
        },
        {
          title: "Low Stock Items",
          value: "0",
          subtitle: "Need reorder",
          icon: AlertCircle,
          color: "from-orange-500 to-orange-600",
          bgColor: "bg-orange-50",
        },
        {
          title: "Out of Stock",
          value: "0",
          subtitle: "Unavailable",
          icon: AlertCircle,
          color: "from-red-500 to-red-600",
          bgColor: "bg-red-50",
        },
      ];
    }

    return [
      {
        title: "Total Products",
        value: inventoryStats?.totalProducts?.toString() || "0",
        subtitle: "Active products",
        icon: Package,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Stock",
        value: inventoryStats?.totalStock?.toString() || "0",
        subtitle: "Units in stock",
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Low Stock Items",
        value: inventoryStats?.lowStockItems?.toString() || "0",
        subtitle: "Need reorder",
        icon: AlertCircle,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Out of Stock",
        value: inventoryStats?.outOfStock?.toString() || "0",
        subtitle: "Unavailable",
        icon: AlertCircle,
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
      },
    ];
  }, [inventoryStats]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Out of Stock" };
    if (stock < 10) return { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", label: "Low Stock" };
    return { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "In Stock" };
  };

  if (isLoading) return <AttributeManagementSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Inventory Management</h1>
              <p className="text-slate-600">Track and manage your product stock levels</p>
            </div>
            <Link href={"/admin/add-new-product"}>
              <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-medium mb-1">{stat.title}</p>
                      <h3 className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                      <p className="text-xs text-slate-500">{stat.subtitle}</p>
                    </div>
                    <div className={`rounded-lg p-3 bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 py-3 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Product Table */}
            {products && products.length > 0 ? (
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
                    {products.map((product: any) => {
                      const stock = product?.stock || 0;
                      const stockStatus = getStockStatus(stock);
                      return (
                        <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.category?.name || "N/A"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono">
                              {product.sku || "N/A"}
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
                              ${product.price?.toFixed(2) || "0.00"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/admin/edit-product/${product._id}`}>
                              <Button size="sm" variant="outline" className="border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                                Edit
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">No products found</p>
                <p className="text-slate-500 text-sm mb-4">Create your first product to get started</p>
                <Link href={"/admin/add-new-product"}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryManagement;

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Package,
  MoreVertical,
  Grid3X3,
  List,
} from "lucide-react";
import Image from "next/image";
import {
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
} from "@/redux/featured/brands/brandsApi";
import CreateBrand from "@/components/pages/admin/CreateBrand";
import BrandEditor from "@/components/Brand-Editor";
import PaginationControls from "@/components/categorise/PaginationControls";
import BrandManagementSkeleton from "../loadings/BrandManagementSkeleton";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";
  return imagePath;
};

const BrandManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [editBrand, setEditBrand] = useState<any>(null);
  const [addPopup, setAddPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteBrand] = useDeleteBrandMutation();
  const ITEMS_PER_PAGE = viewMode === "grid" ? 12 : 10;

  const { data: brands = [], isLoading, refetch } = useGetAllBrandsQuery();

  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (brandId: string, brandName: string) => {
    const result = await Swal.fire({
      title: "Delete Brand?",
      text: `Remove "${brandName}" from your catalog?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteBrand(brandId).unwrap();
        toast.success("Brand deleted!");
        setCurrentPage(1);
        refetch();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete");
      }
    }
  };

  if (isLoading) return <BrandManagementSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col gap-6">
            {/* Title & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Brands
                </h1>
                <p className="text-slate-400 text-lg">Manage and organize your product brands</p>
              </div>
              <Button
                onClick={() => setAddPopup(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all h-11 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Brand
              </Button>
            </div>

            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 py-3 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-slate-700/50 p-1 rounded-lg border border-slate-600">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="mb-10">
          <Card className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Total Brands</p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-5xl font-bold text-white">{brands.length}</h3>
                    <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Total Items Listed</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{brands.length * 12}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {paginatedBrands.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
                {paginatedBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-slate-700 overflow-hidden flex items-center justify-center relative">
                      {getImageUrl(brand.image) ? (
                        <Image
                          src={getImageUrl(brand.image)}
                          alt={brand.name}
                          fill
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="text-center">
                          <Package className="w-12 h-12 text-slate-500 mx-auto" />
                        </div>
                      )}
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white hover:bg-slate-100 text-slate-900 border-0"
                          onClick={() => setSelectedBrand(brand)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                          onClick={() => setEditBrand(brand)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-white truncate mb-2">{brand.name}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-600 hover:border-red-500 hover:bg-red-500/10 text-red-400 group/del"
                        onClick={() => handleDelete(brand._id, brand.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-2 group-del/hover:scale-110" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3 mb-10">
                {paginatedBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-500 transition-all group"
                  >
                    {/* Left - Image & Name */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {getImageUrl(brand.image) ? (
                          <Image
                            src={getImageUrl(brand.image)}
                            alt={brand.name}
                            fill
                            className="w-full h-full object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{brand.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">ID: {brand._id?.slice(0, 8)}...</p>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 hover:border-slate-500 text-slate-300"
                        onClick={() => setSelectedBrand(brand)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 hover:border-blue-500 hover:bg-blue-500/10 text-blue-400"
                        onClick={() => setEditBrand(brand)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 hover:border-red-500 hover:bg-red-500/10 text-red-400"
                        onClick={() => handleDelete(brand._id, brand.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-full mb-6">
              <Package className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Brands Found</h3>
            <p className="text-slate-400 mb-8">Get started by creating your first brand</p>
            <Button
              onClick={() => setAddPopup(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Brand
            </Button>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={addPopup} onOpenChange={setAddPopup}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Brand</DialogTitle>
          </DialogHeader>
          <CreateBrand
            onClose={() => {
              setAddPopup(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedBrand?.name}</DialogTitle>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-6">
              <div className="w-full h-64 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center relative">
                {getImageUrl(selectedBrand.image) ? (
                  <Image
                    src={getImageUrl(selectedBrand.image)}
                    alt={selectedBrand.name}
                    fill
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-slate-600" />
                )}
              </div>
              <div>
                <h3 className="text-sm text-slate-400 font-medium mb-2">Brand Name</h3>
                <p className="text-lg font-semibold text-white">{selectedBrand.name}</p>
              </div>
              <div>
                <h3 className="text-sm text-slate-400 font-medium mb-2">Brand ID</h3>
                <p className="text-sm text-slate-400 font-mono">{selectedBrand._id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editBrand} onOpenChange={() => setEditBrand(null)}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Brand</DialogTitle>
          </DialogHeader>
          {editBrand && (
            <BrandEditor
              brand={editBrand}
              onClose={() => {
                setEditBrand(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandManagement;

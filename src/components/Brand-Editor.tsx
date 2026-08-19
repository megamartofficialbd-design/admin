/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import {
  useGetSingleBrandQuery,
  useUpdateBrandMutation,
} from "@/redux/featured/brands/brandsApi";
import toast from "react-hot-toast";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface BrandEditorProps {
  brandId: string;
  onClose?: () => void;
}

const BrandEditor: React.FC<BrandEditorProps> = ({ brandId, onClose }) => {
  const { data: brand, isLoading: isFetching } = useGetSingleBrandQuery(brandId);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Load brand data when fetched
  useEffect(() => {
    if (brand) {
      setName(brand.name || "");
      setImagePreview(brand.image || "");
      setImageFile(null);
    }
  }, [brand]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (brand?.image) {
      setImagePreview(brand.image);
    } else {
      setImagePreview("");
    }
  };

  const handleUpdate = async () => {
    // Validate brand ID
    if (!brandId) {
      toast.error("No brand selected!");
      return;
    }

    // Validate name
    if (!name.trim()) {
      toast.error("Brand name is required!");
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("name", name.trim());

      // Add new image if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Call update API
      await updateBrand({ id: brandId, formData }).unwrap();
      
      toast.success("Brand updated successfully!");
      setImageFile(null);

      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error("Update brand error:", error);
      const errorMessage = 
        typeof error === "string" 
          ? error 
          : error?.data?.message || "Failed to update brand";
      toast.error(errorMessage);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500">Loading brand...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CardContent className="p-0">
        <div className="space-y-6">
          {/* Brand Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter brand name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isUpdating}
            />
          </div>

          {/* Brand Image Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Brand Image <span className="text-red-500">*</span>
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="relative w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Brand preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Change/Remove Buttons */}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUpdating}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                      asChild
                      disabled={isUpdating}
                    >
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </span>
                    </Button>
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                    disabled={isUpdating}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUpdating}
                />
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      Click to upload image
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Update Button */}
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !name.trim()}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all"
          >
            {isUpdating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Updating Brand...
              </>
            ) : (
              "Update Brand"
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default BrandEditor;

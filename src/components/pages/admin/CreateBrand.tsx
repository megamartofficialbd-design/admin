/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateBrandMutation } from "@/redux/featured/brands/brandsApi";
import toast from "react-hot-toast";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface CreateBrandProps {
  onClose?: () => void;
}

const CreateBrand: React.FC<CreateBrandProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [createBrand, { isLoading }] = useCreateBrandMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
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
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async () => {
    // Validate name
    if (!name.trim()) {
      toast.error("Brand name is required!");
      return;
    }

    // Validate image
    if (!imageFile) {
      toast.error("Brand image is required!");
      return;
    }

    try {
      // Create FormData with name and image
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("image", imageFile);

      // Call API
      await createBrand(formData).unwrap();
      
      toast.success("Brand created successfully!");

      // Reset form
      setName("");
      setImageFile(null);
      setImagePreview("");

      // Close dialog
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error("Create brand error:", error);
      const errorMessage = 
        typeof error === "string" 
          ? error 
          : error?.data?.message || "Failed to create brand";
      toast.error(errorMessage);
    }
  };

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
              placeholder="Enter brand name (e.g., Nike, Adidas)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                      asChild
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !imageFile}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creating Brand...
              </>
            ) : (
              "Create Brand"
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default CreateBrand;

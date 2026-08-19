/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MultipleSelector from "../ui/multiselect";
import {
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/redux/featured/categories/categoryApi";
import { useForm, FormProvider } from "react-hook-form";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export type Option = {
  value: string;
  label: string;
  disable?: boolean;
};

type CategoryFormValues = {
  name: string;
  details: string;
  parentCategory?: string; // For assigning this category as a sub-category to another
};

type SubCategory = {
  _id: string;
  name: string;
};

export default function Category({
  children,
  type,
  editCategory,
  refetch,
}: {
  children: string;
  type?: string;
  editCategory?: any;
  refetch: any;
}) {
  const [createCategory, { isLoading }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: EditLoading }] =
    useEditCategoryMutation();
  const [bannerImg, setBannerImg] = useState<FileWithPreview | null>(null);
  const [image, setImage] = useState<FileWithPreview | null>(null);
  const [open, setOpen] = useState(false);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      details: "",
      parentCategory: undefined,
    },
  });

  const { handleSubmit, register, setValue, watch, reset } = methods;

  useEffect(() => {
    if (editCategory) {
      reset({
        name: editCategory.name || "",
        details: editCategory.details || "",
        parentCategory: editCategory.parentCategory || undefined,
      });
    }
  }, [editCategory, reset]);

  useEffect(() => {
    if (!editCategory) return;

    const newDeleted: string[] = [];

    if (image && editCategory.image) {
      newDeleted.push(editCategory.image);
    }

    if (bannerImg && editCategory.bannerImg) {
      newDeleted.push(editCategory.bannerImg);
    }

    if (newDeleted.length > 0) {
      setDeletedImages((prev) => [...prev, ...newDeleted]);
    }
  }, [image, bannerImg, editCategory]);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery(undefined);

  // Filter to show only parent categories (not sub-categories) for assignment
  const parentCategoryOptions: Option[] =
    categoriesData
      ?.filter((cat: any) => cat.isSubCategory !== true && cat._id !== editCategory?._id)
      ?.map((cat: any) => ({
        value: cat._id,
        label: cat.name,
      })) ?? [];

  const onSubmit = async (data: CategoryFormValues) => {
    const submitToast = toast.loading(
      type === "edit" ? "Updating Category..." : "Creating Category..."
    );

    try {
      const formData = new FormData();
      let payload: any;

      if (editCategory) {
        payload = {
          name: data.name,
          details: data.details,
          parentCategory: data.parentCategory || null,
          image: editCategory?.image || "",
          bannerImg: editCategory?.bannerImg || "",
          deletedImages: deletedImages || "",
        };
      } else {
        payload = {
          name: data.name,
          details: data.details,
          parentCategory: data.parentCategory || null,
          isSubCategory: !!data.parentCategory,
        };
      }

      formData.append("data", JSON.stringify(payload));

      if (image?.file) {
        formData.append("image", image.file as File);
      }
      if (bannerImg?.file) {
        formData.append("bannerImg", bannerImg.file as File);
      }

      if (type === "edit" && editCategory?._id) {
        await updateCategory({
          id: editCategory._id,
          updateDetails: formData,
        }).unwrap();
        toast.success("Category updated successfully!", { id: submitToast });
      } else {
        await createCategory(formData as any).unwrap();
        toast.success("Category created successfully!", { id: submitToast });
      }

      setOpen(false);
      reset();
      refetch();
      setImage(null);
      setBannerImg(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.errorSources?.[0]?.message ||
        error?.data?.message ||
        error?.message ||
        "Something went wrong!";
      toast.error(errorMessage, { id: submitToast });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{children}</Button>
      </DialogTrigger>
      <DialogContent className="flex  flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {type === "edit" ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Add new category details here.
        </DialogDescription>

        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6 ">
            <div className="max-h-[400px]">
              <BannerImage
                setBannerImg={setBannerImg}
                editCategory={editCategory}
              />
              <Avatar setImage={setImage} editCategory={editCategory} />
              <FormProvider {...methods}>
                <form
                  id="add-category"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1 space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        placeholder="Category Name"
                        {...register("name", { required: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Category Details"
                      {...register("details", { required: true })}
                    />
                  </div>

                  {/* Assign to Parent Category */}
                  <div>
                    <Label>Assign as Sub-Category (Optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Select a parent category if you want this to be a sub-category
                    </p>
                    <MultipleSelector
                      commandProps={{ label: "Select Parent Category" }}
                      defaultOptions={parentCategoryOptions}
                      placeholder="Select parent category..."
                      hideClearAllButton
                      hidePlaceholderWhenSelected
                      emptyIndicator={
                        <p className="text-center text-sm">No parent categories found</p>
                      }
                      value={
                        watch("parentCategory")
                          ? [
                              {
                                value: watch("parentCategory") as string,
                                label:
                                  parentCategoryOptions.find(
                                    (cat) => cat.value === watch("parentCategory")
                                  )?.label || "",
                              },
                            ]
                          : []
                      }
                      onChange={(val) => {
                        setValue("parentCategory", val.length > 0 ? val[0].value : undefined);
                      }}
                    />
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button form="add-category" type="submit" disabled={isLoading || EditLoading}>
            {isLoading || EditLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BannerImage({
  setBannerImg,
  editCategory,
}: {
  setBannerImg: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  editCategory?: any;
}) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept: "image/*",
      initialFiles: [],
    });

  useEffect(() => {
    if (files && files.length > 0) {
      setBannerImg(files[0]);
    } else {
      setBannerImg(null);
    }
  }, [files, setBannerImg]);

  const currentImage = files[0]?.preview || null;

  return (
    <div className="h-32">
      <div className="bg-muted relative flex size-full items-center justify-center overflow-hidden">
        {currentImage ? (
          <Image
            className="size-full object-cover"
            src={currentImage}
            alt={
              files[0]?.preview
                ? "Preview of uploaded image"
                : "Default profile background"
            }
            width={512}
            height={96}
          />
        ) : editCategory ? (
          <Image
            className="size-full object-cover"
            src={
              editCategory?.bannerImg ||
              "https://via.placeholder.com/512x96?text=No+Banner"
            }
            alt="Category Banner"
            width={512}
            height={96}
          />
        ) : (
          <Image
            className="size-full object-cover"
            src="https://via.placeholder.com/512x96?text=No+Banner"
            alt="Default Banner"
            width={512}
            height={96}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
            onClick={openFileDialog}
            aria-label={currentImage ? "Change image" : "Upload image"}
          >
            <ImagePlusIcon size={16} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove image"
            >
              <XIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        {...getInputProps()}
        className="sr-only"
        aria-label="Upload image file"
      />
    </div>
  );
}

function Avatar({
  setImage,
  editCategory,
}: {
  setImage: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  editCategory?: any;
}) {
  const [{ files }, { openFileDialog, getInputProps }] = useFileUpload({
    accept: "image/*",
    initialFiles: [],
  });

  useEffect(() => {
    if (files && files.length > 0) {
      setImage(files[0]);
    } else {
      setImage(null);
    }
  }, [files, setImage]);

  const currentImage = files[0]?.preview || null;

  return (
    <div className="-mt-10 px-6">
      <div className="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
        {currentImage ? (
          <Image
            src={currentImage}
            className="size-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        ) : (
          editCategory && (
            <Image
              src={editCategory.image}
              className="size-full object-cover"
              width={80}
              height={80}
              alt="Profile image"
            />
          )
        )}
        <button
          type="button"
          className="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
          onClick={openFileDialog}
          aria-label="Change profile picture"
        >
          <ImagePlusIcon size={16} aria-hidden="true" />
        </button>
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

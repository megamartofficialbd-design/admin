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
import { ImagePlusIcon, XIcon } from "lucide-react";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "@/redux/featured/Banner/bannerApi";

// ---------- Types ----------
export interface BannerFormValues {
  image: string;
}

export interface Banner {
  _id: string;
  image?: string;
}

export interface BannerCreateUpdateProps {
  children: React.ReactNode;
  type?: "edit" | "create";
  editBanner?: Banner;
  refetch?: () => void;
}

// ---------- Component ----------
export default function BannerCreateUpdate({
  children,
  type,
  editBanner,
  refetch,
}: BannerCreateUpdateProps) {
  const [createBanner, { isLoading }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: editLoading }] = useUpdateBannerMutation();
  const [bannerImg, setBannerImg] = useState<FileWithPreview | null>(null);
  const [open, setOpen] = useState(false);

  // ---------- Submit Handler ----------
  const onSubmit = async () => {
    if (!bannerImg?.file && !editBanner?.image) {
      toast.error("Please select an image!");
      return;
    }

    const submitToast = toast.loading(
      type === "edit" ? "Updating Banner..." : "Creating Banner..."
    );

    try {
      const formData = new FormData();

      if (bannerImg?.file) {
        formData.append("image", bannerImg.file as File);
      }

      console.log("Submitting banner with formData:", formData);

      if (type === "edit" && editBanner?._id) {
        const response = await updateBanner({
          id: editBanner._id,
          body: formData,
        }).unwrap();
        console.log("Update response:", response);
        toast.success("Banner updated successfully!", { id: submitToast });
      } else {
        const response = await createBanner(formData).unwrap();
        console.log("Create response:", response);
        toast.success("Banner created successfully!", { id: submitToast });
      }

      setOpen(false);
      refetch?.();
      setBannerImg(null);
    } catch (error: any) {
      console.error("Banner submission error:", error);
      const errorMessage =
        error?.data?.errorSources?.[0]?.message ||
        error?.data?.message ||
        error?.message ||
        "Something went wrong!";
      toast.error(errorMessage, { id: submitToast });
    }
  };

  // ---------- Render ----------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof children === "string" ? (
          <Button>{children}</Button>
        ) : (
          children
        )}
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {type === "edit" ? "Edit Banner" : "Add Banner"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Add or update banner image here.
        </DialogDescription>

        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <BannerImage setBannerImg={setBannerImg} editBanner={editBanner} />
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading || editLoading} onClick={onSubmit}>
            {isLoading || editLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Banner Image Upload ----------
function BannerImage({
  setBannerImg,
  editBanner,
}: {
  setBannerImg: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  editBanner?: Banner;
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
      <div className="bg-muted relative flex size-full items-center justify-center overflow-hidden bg-gray-200">
        {currentImage || editBanner?.image ? (
          <Image
            className="size-full object-cover"
            src={currentImage || editBanner?.image || ""}
            alt="Banner Image"
            width={512}
            height={96}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
            No Banner Image
          </div>
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
              onClick={() => files[0] && removeFile(files[0].id)}
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

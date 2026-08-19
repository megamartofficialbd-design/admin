'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import MultipleSelector from '../ui/multiselect'
import { useForm, FormProvider } from 'react-hook-form'
import { ImagePlusIcon, XIcon } from 'lucide-react'
import { FileWithPreview } from '@/hooks/use-file-upload'
import toast from 'react-hot-toast'
import {
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useGetAllCategoriesQuery,
} from '@/redux/featured/categories/categoryApi'

type SubCategoryFormValues = {
  name: string
  details: string
  parentCategory?: string
}

type Option = {
  value: string
  label: string
}

export default function SubCategory({
  children,
  refetch,
  editSubCategory,
  setOpen,
}: {
  children: React.ReactNode
  refetch: () => void
  editSubCategory?: any
  setOpen?: (open: boolean) => void
}) {
  const [open, setOpenDialog] = useState(false)
  const [image, setImage] = useState<FileWithPreview | null>(null)
  const [bannerImg, setBannerImg] = useState<FileWithPreview | null>(null)
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  const [createCategory] = useCreateCategoryMutation()
  const [updateCategory] = useEditCategoryMutation()
  const { data: allCategories } = useGetAllCategoriesQuery()

  const methods = useForm<SubCategoryFormValues>({
    defaultValues: {
      name: '',
      details: '',
      parentCategory: '',
    },
  })

  const { reset, watch, setValue } = methods

  useEffect(() => {
    if (editSubCategory) {
      setValue('name', editSubCategory.name)
      setValue('details', editSubCategory.details)
      if (editSubCategory.parentId) {
        setValue('parentCategory', editSubCategory.parentId)
      }
      if (editSubCategory.image) {
        setImage({
          file: editSubCategory.image as any,
          preview: editSubCategory.image,
          id: 'image-1',
        })
      }
      if (editSubCategory.bannerImg) {
        setBannerImg({
          file: editSubCategory.bannerImg as any,
          preview: editSubCategory.bannerImg,
          id: 'banner-1',
        })
      }
    }
  }, [editSubCategory, setValue])

  // Get only main categories (not sub-categories) for parent selection
  const parentCategoryOptions: Option[] = (allCategories || [])
    .filter((cat: any) => cat.isSubCategory !== true && cat._id)
    .map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    }))

  const onSubmit = async (data: SubCategoryFormValues) => {
    const submitToast = toast.loading(
      editSubCategory ? 'Updating Sub Category...' : 'Creating Sub Category...'
    )

    try {
      const formData = new FormData()
      let payload

      if (editSubCategory) {
        payload = {
          name: data.name,
          details: data.details,
          isSubCategory: true,
          parentCategory: data.parentCategory || null,
          image: editSubCategory?.image || '',
          bannerImg: editSubCategory?.bannerImg || '',
          deletedImages: deletedImages || '',
          subCategories: [],
        }
      } else {
        payload = {
          name: data.name,
          details: data.details,
          isSubCategory: true,
          parentCategory: data.parentCategory || null,
          subCategories: [],
        }
      }

      formData.append('data', JSON.stringify(payload))

      if (image?.file) {
        formData.append('image', image.file as File)
      }
      if (bannerImg?.file) {
        formData.append('bannerImg', bannerImg.file as File)
      }

      if (editSubCategory) {
        await updateCategory({
          id: editSubCategory._id,
          updateDetails: formData,
        }).unwrap()
        toast.success('Sub Category updated successfully!', { id: submitToast })
      } else {
        await createCategory(formData as any).unwrap()
        toast.success('Sub Category created successfully!', { id: submitToast })
      }

      setOpenDialog(false)
      reset()
      refetch()
      setImage(null)
      setBannerImg(null)
    } catch (error: any) {
      const errorMessage =
        error?.data?.errorSources?.[0]?.message ||
        error?.data?.message ||
        error?.message ||
        'Something went wrong!'
      toast.error(errorMessage, { id: submitToast })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpenDialog(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editSubCategory ? 'Edit' : 'Create'} Sub Category</DialogTitle>
            <DialogDescription>
              {editSubCategory
                ? 'Update the sub category details'
                : 'Create a new sub category'}
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Sub Category Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter sub category name"
                  {...methods.register('name', { required: 'Name is required' })}
                  className="mt-2"
                />
                {methods.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Details */}
              <div>
                <Label htmlFor="details">Description</Label>
                <Textarea
                  id="details"
                  placeholder="Enter sub category description"
                  {...methods.register('details')}
                  className="mt-2 min-h-24"
                />
              </div>

              {/* Parent Category */}
              <div>
                <Label>Assign to Parent Category</Label>
                <MultipleSelector
                  commandProps={{ label: 'Select Parent Category' }}
                  defaultOptions={parentCategoryOptions}
                  placeholder="Select a parent category (optional)"
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No parent categories found</p>
                  }
                  value={
                    watch('parentCategory')
                      ? [
                          {
                            value: watch('parentCategory') as string,
                            label:
                              allCategories?.find(
                                (cat: any) => cat._id === watch('parentCategory')
                              )?.name || '',
                          },
                        ]
                      : []
                  }
                  onChange={(val) => {
                    setValue('parentCategory', val.length > 0 ? val[0].value : '')
                  }}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Sub Category Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {image?.preview ? (
                    <div className="relative inline-block">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImagePlusIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setImage({
                              file,
                              preview: URL.createObjectURL(file),
                              id: `image-${Date.now()}`,
                            })
                          }
                        }}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editSubCategory ? 'Update' : 'Create'} Sub Category
                </button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  )
}

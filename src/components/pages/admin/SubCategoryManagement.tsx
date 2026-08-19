'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, FolderOpen, Layers, ShoppingBag, CheckCircle, Download, Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  useGetAllCategoriesQuery,
  useGetAllSubCategoriesQuery,
} from '@/redux/featured/categories/categoryApi'
import { selectCategories, setCategories } from '@/redux/featured/categories/categorySlice'
import PaginationControls from '@/components/categorise/PaginationControls'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { ICategory } from '@/types/Category'
import CategoryManagementSkeleton from '../loadings/CategoryManagementSkeleton'
import SubCategory from '@/components/sub-category/SubCategory'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function SubCategoryManagement() {
  const { data: allCategories, isLoading, refetch } = useGetAllCategoriesQuery()
  const { data: allSubCategoriesFromAPI } = useGetAllSubCategoriesQuery()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const ITEMS_PER_PAGE = 10

  // Populate Redux state
  useEffect(() => {
    if (allCategories) {
      dispatch(
        setCategories(
          allCategories.map(cat => ({ ...cat, isFeatured: cat.isFeatured ?? false }))
        )
      )
    }
  }, [allCategories, dispatch])

  // Get all sub-categories - use API data directly if available
  const allSubCategories = useMemo(() => {
    // First try to use dedicated API endpoint data
    if (allSubCategoriesFromAPI && allSubCategoriesFromAPI.length > 0) {
      return allSubCategoriesFromAPI.map((subCat: any) => {
        return {
          _id: subCat._id,
          name: subCat.name,
          slug: subCat.slug,
          details: subCat.details,
          status: subCat.status,
          image: subCat.image,
          bannerImg: subCat.bannerImg,
          parentCategory: subCat.parentCategory?.name || 'Unassigned',
          parentId: subCat.parentCategory?._id,
          products: subCat.products?.length || 0,
          createdAt: subCat.createdAt,
        }
      })
    }
    
    // Fallback to filtering from all categories
    if (!categories || categories.length === 0) return []
    
    return categories
      .filter((cat: any) => cat.isSubCategory === true)
      .map((subCat: any) => {
        const parentCat = categories.find((cat: any) => 
          subCat.parentCategory && cat._id === subCat.parentCategory
        )
        
        return {
          _id: subCat._id,
          name: subCat.name,
          slug: subCat.slug,
          details: subCat.details,
          status: subCat.status,
          image: subCat.image,
          bannerImg: subCat.bannerImg,
          parentCategory: parentCat?.name || 'Unassigned',
          parentId: subCat.parentCategory,
          products: subCat.products?.length || 0,
          createdAt: subCat.createdAt,
        }
      })
  }, [allSubCategoriesFromAPI, categories])

  // Filter by search
  const filteredSubCategories = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return allSubCategories.filter(
      subCat =>
        subCat.name?.toLowerCase().includes(term) ||
        subCat.parentCategory?.toLowerCase().includes(term) ||
        subCat.details?.toLowerCase().includes(term)
    )
  }, [allSubCategories, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredSubCategories.length / ITEMS_PER_PAGE)
  const paginatedSubCategories = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSubCategories.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredSubCategories, currentPage])

  if(isLoading) return <CategoryManagementSkeleton/>

  // Stats
  const totalSubCategories = allSubCategories.length
  const assignedSubCategories = allSubCategories.filter((sc: any) => sc.parentId).length
  const unassignedSubCategories = totalSubCategories - assignedSubCategories
  const activeSubCategories = allSubCategories.filter((sc: any) => sc.status === 'active').length

  // Handle delete
  const handleDeleteSubCategory = async (subCategoryId: string, subCategoryName: string) => {
    const result = await Swal.fire({
      title: 'Delete Sub Category?',
      text: `Are you sure you want to delete "${subCategoryName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/category/delete-category/${subCategoryId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete sub category')
        }

        await Swal.fire('Deleted!', 'Sub category deleted successfully', 'success')
        refetch()
      } catch (error: any) {
        await Swal.fire('Error!', error.message || 'Failed to delete sub category', 'error')
      }
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (subCategoryId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const toastId = toast.loading(`Updating status...`)

    try {
      const response = await fetch(`/api/category/${subCategoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Status updated to ${newStatus}`, { id: toastId })
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status', { id: toastId })
    }
  }

  const StatCard = ({ icon, label, value, subtitle }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-500 text-xs mt-2">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 py-6 px-4 md:px-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<FolderOpen className="w-8 h-8 text-blue-500" />}
          label="Total Sub Categories"
          value={totalSubCategories}
          subtitle="All sub categories"
        />
        <StatCard 
          icon={<CheckCircle className="w-8 h-8 text-green-500" />}
          label="Assigned"
          value={assignedSubCategories}
          subtitle="Linked to parent"
        />
        <StatCard 
          icon={<Layers className="w-8 h-8 text-purple-500" />}
          label="Unassigned"
          value={unassignedSubCategories}
          subtitle="Need parent category"
        />
        <StatCard 
          icon={<ShoppingBag className="w-8 h-8 text-orange-500" />}
          label="Active"
          value={activeSubCategories}
          subtitle="Currently active"
        />
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Search sub category name, parent or description..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 py-2 border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download size={18} /> Export
          </button>
          <SubCategory refetch={refetch} setOpen={setIsOpen}>
            Add Sub Category
          </SubCategory>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">#</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Image</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Sub Category Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Parent Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Products</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubCategories.length > 0 ? (
                paginatedSubCategories.map((subCat: any, index: number) => (
                  <tr key={subCat._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-4 px-6">
                      {subCat.image ? (
                        <Image
                          src={subCat.image}
                          alt={subCat.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{subCat.name}</p>
                      <p className="text-xs text-gray-500">{subCat.slug}</p>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subCat.parentId 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subCat.parentCategory}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <button
                        onClick={() => handleStatusToggle(subCat._id, subCat.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:opacity-80 ${
                          subCat.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {subCat.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center font-medium">
                      {subCat.products}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <SubCategory refetch={refetch} editSubCategory={subCat}>
                          <button 
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" 
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        </SubCategory>
                        <button 
                          onClick={() => handleDeleteSubCategory(subCat._id, subCat.name)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No sub categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubCategories.length)} of {filteredSubCategories.length} entries
            </p>
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredSubCategories.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

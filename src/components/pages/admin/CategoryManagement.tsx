/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Search, FolderOpen, Layers, ShoppingBag, CheckCircle, Download, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  useGetAllCategoriesQuery,
  useEditCategoryMutation,
} from '@/redux/featured/categories/categoryApi'
import { selectCategories, setCategories } from '@/redux/featured/categories/categorySlice'
import ViewCategoryDetails from '@/components/category/ViewCategory'
import Category from '@/components/category/Category'
import PaginationControls from '@/components/categorise/PaginationControls'
import Swal from 'sweetalert2'
import { ICategory } from '@/types/Category'
import CategoryManagementSkeleton from '../loadings/CategoryManagementSkeleton'

export default function CategoryManagement() {
  const { data: allCategories, isLoading, refetch } = useGetAllCategoriesQuery()
  const [editCategory] = useEditCategoryMutation()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
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

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return categories.filter(
      cat =>
        cat.name.toLowerCase().includes(term) ||
        cat?.details?.toLowerCase().includes(term)
    )
  }, [categories, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCategories.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredCategories, currentPage])

  // Toggle featured status
  const handleToggleFeatured = async (category: ICategory) => {
    const newFeaturedStatus = !category.isFeatured
    const formData: any = new FormData();
    const payload = {
      isFeatured: newFeaturedStatus
    }

    formData.append("data", JSON.stringify(payload));

    try {
      await editCategory({ id: category._id, updateDetails: formData }).unwrap()
      refetch()
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `"${category.name}" ${newFeaturedStatus ? 'marked as featured' : 'removed from featured'} successfully!`,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not update featured status.',
      })
    }
  }

  // Toggle status (active/inactive)
  const handleToggleStatus = async (category: ICategory) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active'
    const formData: any = new FormData();
    const payload = {
      status: newStatus
    }

    formData.append("data", JSON.stringify(payload));

    try {
      await editCategory({ id: category._id, updateDetails: formData }).unwrap()
      refetch()
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `"${category.name}" status changed to ${newStatus}!`,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not update category status.',
      })
    }
  }

  if(isLoading) return <CategoryManagementSkeleton/>

  // Calculate stats
  const totalCategories = categories.length
  const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0)
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0)
  const activeCategories = categories.filter(cat => cat.status === 'active').length

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<FolderOpen className="w-8 h-8 text-blue-500" />}
          label="Total Category"
          value={totalCategories}
          subtitle="All Categories"
        />
        <StatCard 
          icon={<Layers className="w-8 h-8 text-green-500" />}
          label="Total Sub Category"
          value={totalSubcategories}
          subtitle="All Sub Categories"
        />
        <StatCard 
          icon={<ShoppingBag className="w-8 h-8 text-purple-500" />}
          label="Total Products"
          value={totalProducts}
          subtitle="All Products"
        />
        <StatCard 
          icon={<CheckCircle className="w-8 h-8 text-orange-500" />}
          label="Active Categories"
          value={activeCategories}
          subtitle="Categories Active"
        />
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Search category..."
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
          <Category refetch={refetch}>
            Add Category
          </Category>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">#</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Category Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Sub Categories</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Products</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Description</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Featured</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {category.subCategories?.length || 0}
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {category.products?.length || 0}
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      <span title={category?.details}>
                        {category?.details ? (category.details.length > 40 ? category.details.substring(0, 40) + '...' : category.details) : 'No description'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleFeatured(category)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          category.isFeatured
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.isFeatured ? '✓ Yes' : '✗ No'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(category)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          category.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        <CheckCircle size={14} />
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Category type="edit" editCategory={category} refetch={refetch}>
                          Edit
                        </Category>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No categories found
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
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length} entries
            </p>
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredCategories.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

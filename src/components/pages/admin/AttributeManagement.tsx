/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Edit2, Settings, TrendingUp, Package, AlertCircle, Grid3x3 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  AttributesData,
  selectAttributes,
  setAttributes,
} from '@/redux/featured/attribute/attributeSlice';
import { IAttribute } from '@/types/attribute';
import {
  useGetAttributesQuery,
  useGetAttributeStatusQuery,
  useDeleteAttributeMutation,
} from '@/redux/featured/attribute/attributeApi';
import CreateAndUpdateAttribute from '@/components/attributes/CreateAndUpdateAttribute';
import { ITagQueryParams } from '@/types/tags';
import PaginationView from '@/components/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AttributeValuesModal from '@/components/attributes/AttributeValuesModal';
import AttributeManagementSkeleton from '../loadings/AttributeManagementSkeleton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AttributeManagement() {
  const [queryParams, setQueryParams] = useState<ITagQueryParams>({
    limit: 12,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const { data, isLoading, refetch } = useGetAttributesQuery(queryParams);
  const {
    data: AttributeStats,
    isLoading: StatsLoading,
    refetch: statsRefetch,
  } = useGetAttributeStatusQuery(undefined);
  const [deleteAttribute] = useDeleteAttributeMutation();
  const dispatch = useAppDispatch();
  const allAttributes = useAppSelector(selectAttributes);

  useEffect(() => {
    if (data) {
      dispatch(setAttributes(data as any));
    }
  }, [dispatch, data]);

  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      page: currentPage,
      searchTerm: searchTerm || undefined,
      type: selectedType,
    }));
  }, [currentPage, searchTerm, selectedType]);

  const typeColors: Record<string, { bg: string; text: string; gradient: string; dot: string }> = {
    dropdown: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      gradient: 'from-blue-500 to-blue-600',
      dot: 'bg-blue-500',
    },
    color: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      gradient: 'from-purple-500 to-purple-600',
      dot: 'bg-purple-500',
    },
    text: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      gradient: 'from-emerald-500 to-emerald-600',
      dot: 'bg-emerald-500',
    },
    number: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      gradient: 'from-orange-500 to-orange-600',
      dot: 'bg-orange-500',
    },
  };

  const getTypeColor = (type: string) => {
    return typeColors[type.toLowerCase()] || typeColors.dropdown;
  };

  const stats = useMemo(() => {
    if (!AttributeStats) {
      return [
        {
          title: 'Total Attributes',
          value: '0',
          subtitle: 'All attributes',
          icon: Settings,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          title: 'Required Attributes',
          value: '0',
          subtitle: 'Must-have fields',
          icon: AlertCircle,
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
        },
        {
          title: 'Dropdown Type',
          value: '0',
          subtitle: 'Most used',
          icon: Grid3x3,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          title: 'Categories',
          value: '0',
          subtitle: 'Attribute groups',
          icon: Package,
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
        },
      ];
    }

    return [
      {
        title: 'Total Attributes',
        value: AttributeStats?.totalAttributes?.toString() || '0',
        subtitle: 'All attributes in system',
        icon: Settings,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Required Attributes',
        value: AttributeStats?.requiredAttributes?.toString() || '0',
        subtitle: 'Must-have fields',
        icon: AlertCircle,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
      },
      {
        title: 'Dropdown Type',
        value: AttributeStats?.dropdownAttributes?.toString() || '0',
        subtitle: 'Most common type',
        icon: Grid3x3,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Categories',
        value: AttributeStats?.categories?.toString() || '0',
        subtitle: 'Attribute groups',
        icon: Package,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
      },
    ];
  }, [AttributeStats]);

  const handleDelete = async (attributeId: string, attributeName: string) => {
    const result = await Swal.fire({
      title: 'Delete Attribute?',
      text: `Are you sure you want to delete "${attributeName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        await deleteAttribute(attributeId).unwrap();
        toast.success('Attribute deleted successfully!');
        refetch();
        statsRefetch();
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete attribute');
      }
    }
  };

  const types = ['dropdown', 'color', 'text', 'number'];

  if (!AttributeStats && !allAttributes) {
    return <AttributeManagementSkeleton />;
  }

  if (isLoading) return <AttributeManagementSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Product Attributes</h1>
              <p className="text-slate-600">Define and manage product characteristics</p>
            </div>
            <CreateAndUpdateAttribute
              refetch={refetch}
              statsRefetch={statsRefetch}
              triggerButton={
                <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Attribute
                </Button>
              }
            >
              + Add Attribute
            </CreateAndUpdateAttribute>
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
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search attributes..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 py-3 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors"
                  />
                </div>

                <Select value={selectedType || 'all'} onValueChange={(value) => {
                  setSelectedType(value === 'all' ? undefined : value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="capitalize">{type}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attributes Grid */}
            {allAttributes?.data && allAttributes.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {allAttributes.data.map((attribute: IAttribute) => {
                    const colors = getTypeColor(attribute.type);
                    return (
                      <div
                        key={attribute._id}
                        className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} backdrop-blur-sm`}>
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <span className={`text-xs font-semibold capitalize ${colors.text}`}>
                              {attribute.type}
                            </span>
                          </div>
                        </div>

                        {/* Attribute Header */}
                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 truncate">{attribute.name}</h3>
                              <p className="text-sm text-slate-500">Attribute</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-slate-50 rounded-lg p-3 mb-5 space-y-2 border-b border-slate-200 pb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Category:</span>
                              <span className="font-semibold text-slate-900">{attribute.category?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Required:</span>
                              <Badge className={attribute.required ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}>
                                {attribute.required ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <CreateAndUpdateAttribute
                              updateAttribute={attribute}
                              type="edit"
                              refetch={refetch}
                              statsRefetch={statsRefetch}
                              triggerButton={
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span className="hidden sm:inline ml-1">Edit</span>
                                </Button>
                              }
                            >
                              Edit
                            </CreateAndUpdateAttribute>

                            <AttributeValuesModal
                              attribute={attribute}
                              triggerButton={
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                >
                                  <Grid3x3 className="w-4 h-4" />
                                  <span className="hidden sm:inline ml-1">Values</span>
                                </Button>
                              }
                            />

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                              onClick={() => handleDelete(attribute._id, attribute.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </div>

                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-300" />
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {allAttributes?.meta && (
                  <div className="flex justify-center pt-4 border-t border-slate-200">
                    <PaginationView
                      setCurrentPage={setCurrentPage}
                      currentPage={currentPage}
                      meta={allAttributes.meta}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Settings className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">No attributes found</p>
                <p className="text-slate-500 text-sm">Create your first attribute to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

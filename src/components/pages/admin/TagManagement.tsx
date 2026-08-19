"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Edit2, Eye, TrendingUp, Tag, Zap, Package } from "lucide-react";
import { setTags } from "@/redux/featured/tags/tagsSlice";
import { useAppDispatch } from "@/redux/hooks";
import { ITag, ITagQueryParams } from "@/types/tags";
import CreateAndUpdateTag from "@/components/tag/CreateAndUpdate";
import ViewTagDetails from "@/components/tag/ViewTag";
import {
  useGetAllTagsQuery,
  useGetTagStatusQuery,
  useDeleteTagMutation,
} from "@/redux/featured/tags/tagsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationView from "@/components/Pagination";
import TagManagementSkeleton from "../loadings/TagManagementSkeleton";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface TagData {
  data: ITag[];
  meta: any;
}

const TagManagement = () => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [queryParams, setQueryParams] = useState<ITagQueryParams>({ limit: 12 });
  const [deleteTag] = useDeleteTagMutation();

  const {
    data: TagStatus,
    isLoading: TagStatusLoading,
    refetch: tagStatusRefetch,
  } = useGetTagStatusQuery(undefined);

  const { data: allTags, isLoading, refetch } = useGetAllTagsQuery(queryParams);

  useEffect(() => {
    if (allTags) {
      dispatch(setTags(allTags as TagData));
      tagStatusRefetch();
    }
  }, [dispatch, allTags, tagStatusRefetch]);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      page: currentPage,
      searchTerm: searchTerm || undefined,
      type: selectedType,
    }));
  }, [currentPage, searchTerm, selectedType]);

  const types = [
    "Marketing",
    "Status",
    "Promotion",
    "Quality",
    "Feature",
    "Exclusivity",
  ];

  const typeColors: Record<string, { bg: string; text: string; dot: string; gradient: string }> = {
    Marketing: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      dot: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
    },
    Status: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      dot: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    Promotion: {
      bg: "bg-pink-100",
      text: "text-pink-800",
      dot: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
    },
    Quality: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      dot: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
    },
    Feature: {
      bg: "bg-teal-100",
      text: "text-teal-800",
      dot: "bg-teal-500",
      gradient: "from-teal-500 to-teal-600",
    },
    Exclusivity: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      dot: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
    },
  };

  const getTypeColor = (type: string) => {
    return typeColors[type] || typeColors.Marketing;
  };

  const stats = useMemo(() => {
    if (!TagStatus) {
      return [
        {
          title: "Total Tags",
          value: "0",
          subtitle: "All tags",
          icon: Tag,
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          title: "Most Used Tag",
          value: "0",
          subtitle: "Usage count",
          icon: TrendingUp,
          color: "from-emerald-500 to-emerald-600",
          bgColor: "bg-emerald-50",
        },
        {
          title: "Tag Types",
          value: "0",
          subtitle: "Categories",
          icon: Zap,
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50",
        },
        {
          title: "Tagged Products",
          value: "0",
          subtitle: "Products with tags",
          icon: Package,
          color: "from-orange-500 to-orange-600",
          bgColor: "bg-orange-50",
        },
      ];
    }

    return [
      {
        title: "Total Tags",
        value: TagStatus?.data?.totalTags?.toString() || "0",
        subtitle: "Active tags in system",
        icon: Tag,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Most Used Tag",
        value: TagStatus?.data?.mostUsedTagAgg?.[0]?.count?.toString() || "0",
        subtitle: `#${TagStatus?.data?.mostUsedTagAgg?.[0]?.name || "N/A"}`,
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Tag Types",
        value: types.length.toString(),
        subtitle: "Different categories",
        icon: Zap,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Tagged Products",
        value: TagStatus?.data?.taggedProducts?.toString() || "0",
        subtitle: "Products with tags",
        icon: Package,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
      },
    ];
  }, [TagStatus]);

  const handleDelete = async (tagId: string, tagName: string) => {
    const result = await Swal.fire({
      title: "Delete Tag?",
      text: `Are you sure you want to delete "${tagName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteTag(tagId).unwrap();
        toast.success("Tag deleted successfully!");
        refetch();
        tagStatusRefetch();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete tag");
      }
    }
  };

  if (!allTags && !TagStatus) {
    return <TagManagementSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Tag Management</h1>
              <p className="text-slate-600">Organize and manage product tags</p>
            </div>
            <CreateAndUpdateTag
              refetch={refetch}
              tagStatusRefetch={tagStatusRefetch}
              triggerButton={
                <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Tag
                </Button>
              }
            >
              + Add Tag
            </CreateAndUpdateTag>
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

        {/* Tag Types Section */}
        {!TagStatusLoading && TagStatus?.data?.tagTypesAgg && (
          <Card className="border-0 shadow-md mb-8">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Tag Categories</h2>
                <p className="text-slate-600 text-sm">Overview of tag types</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {TagStatus?.data?.tagTypesAgg?.map((type: any) => {
                  const colors = getTypeColor(type.name);
                  return (
                    <div key={type.name} className="group">
                      <div className={`${colors.bgColor} rounded-lg p-4 text-center mb-3 group-hover:shadow-md transition-shadow`}>
                        <p className="text-3xl font-bold text-slate-900">{type.count}</p>
                        <p className="text-xs text-slate-600 mt-1">tags</p>
                      </div>
                      <Badge className={`${colors.bg} ${colors.text} w-full justify-center`}>
                        {type.name}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 py-3 bg-slate-50 border-slate-200 rounded-lg focus:bg-white transition-colors"
                  />
                </div>

                <Select value={selectedType || "all"} onValueChange={(value) => {
                  setSelectedType(value === "all" ? undefined : value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags Grid */}
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading tags...</div>
            ) : allTags?.data && allTags.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {allTags.data.map((tag: ITag) => {
                    const colors = getTypeColor(tag.type);
                    return (
                      <div
                        key={tag._id}
                        className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Type Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} backdrop-blur-sm`}>
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <span className={`text-xs font-semibold ${colors.text}`}>
                              {tag.type}
                            </span>
                          </div>
                        </div>

                        {/* Tag Header */}
                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Tag className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 truncate">{tag.name}</h3>
                              <p className="text-sm text-slate-500">Tag</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-slate-50 rounded-lg p-3 mb-5 border-b border-slate-200 pb-4">
                            <p className="text-xs text-slate-500 font-medium mb-1">Description</p>
                            <p className="text-sm text-slate-700 line-clamp-2">{tag.details || "No description"}</p>
                          </div>

                          {/* Stats */}
                          <div className="mb-5 text-sm">
                            <p className="text-slate-600 font-medium">Status: <span className="text-slate-900 font-semibold">Active</span></p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <ViewTagDetails tag={tag}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline ml-1">View</span>
                              </Button>
                            </ViewTagDetails>

                            <CreateAndUpdateTag
                              type="edit"
                              updateTag={tag}
                              refetch={refetch}
                              tagStatusRefetch={tagStatusRefetch}
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
                            </CreateAndUpdateTag>

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                              onClick={() => handleDelete(tag._id, tag.name)}
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
                {allTags?.meta && (
                  <div className="flex justify-center pt-4 border-t border-slate-200">
                    <PaginationView
                      setCurrentPage={setCurrentPage}
                      currentPage={currentPage}
                      meta={allTags.meta}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Tag className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">No tags found</p>
                <p className="text-slate-500 text-sm">Create your first tag to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TagManagement;

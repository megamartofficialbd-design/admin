'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface InventoryStatsProps {
  inventoryStats: any;
  isLoading: boolean;
}

const InventoryStatsCard = ({
  inventoryStats,
  isLoading,
}: InventoryStatsProps) => {
  const stats = [
    {
      title: 'Total Products',
      value: inventoryStats?.totalProducts?.toString() || '0',
      subtitle: 'Active products',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Stock',
      value: inventoryStats?.totalStock?.toString() || '0',
      subtitle: 'Units in stock',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Low Stock Items',
      value: inventoryStats?.lowStockItems?.toString() || '0',
      subtitle: 'Need reorder',
      icon: AlertCircle,
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Out of Stock',
      value: inventoryStats?.outOfStock?.toString() || '0',
      subtitle: 'Unavailable',
      icon: AlertCircle,
      gradient: 'from-red-500 to-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-10 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
                <div
                  className={`rounded-lg p-3 bg-gradient-to-br ${stat.gradient}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryStatsCard;

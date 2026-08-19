'use client';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download } from "lucide-react"

interface Props {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const InventorySearchBar = ({ searchTerm, setSearchTerm }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 py-3 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="flex gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}

export default InventorySearchBar

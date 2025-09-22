"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationQueries } from "@/types/pagination";
import PaginationSection from "@/components/PaginationSection";
import useGetProperties from "../_hooks/useGetProperty";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import PropertyCard from "./PropertyCard";

interface PropertySearchQueries extends PaginationQueries {
  search?: string;
  category?: string;
  location?: string;
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string;
}

interface FilterSheetProps {
  onFiltersChange: (filters: PropertySearchQueries) => void;
  currentFilters: PropertySearchQueries;
}

const FilterSheet = ({ onFiltersChange, currentFilters }: FilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      page: 1,
      take: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Properti</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cari Properti</Label>
            <Input
              placeholder="Nama properti..."
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                search: e.target.value || undefined
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Destinasi</Label>
            <Input
              placeholder="Kota atau lokasi..."
              value={localFilters.destination || localFilters.location || ''}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                destination: e.target.value || undefined,
                location: undefined // Clear location when destination is set
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Check-in Date</Label>
            <Input
              type="date"
              value={localFilters.checkInDate || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                checkInDate: e.target.value || undefined
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Check-out Date</Label>
            <Input
              type="date"
              value={localFilters.checkOutDate || ''}
              min={localFilters.checkInDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                checkOutDate: e.target.value || undefined
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Jumlah Tamu</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={localFilters.capacity || ''}
              placeholder="Jumlah tamu"
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                capacity: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Urutkan Berdasarkan</Label>
            <Select
              value={localFilters.sortBy || 'createdAt'}
              onValueChange={(value) => 
                setLocalFilters(prev => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Terbaru</SelectItem>
                <SelectItem value="title">Nama A-Z</SelectItem>
                <SelectItem value="location">Lokasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Urutan</Label>
            <Select
              value={localFilters.sortOrder || 'desc'}
              onValueChange={(value) => 
                setLocalFilters(prev => ({ ...prev, sortOrder: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Menurun</SelectItem>
                <SelectItem value="asc">Menaik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Terapkan Filter
            </Button>
            <Button onClick={handleClearFilters} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const PropertyListContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // UPDATED: Read all URL parameters properly
  const [filters, setFilters] = useState<PropertySearchQueries>(() => ({
    search: searchParams.get('search') || undefined,
    destination: searchParams.get('destination') || undefined,
    location: searchParams.get('location') || undefined,
    checkInDate: searchParams.get('checkInDate') || undefined,
    checkOutDate: searchParams.get('checkOutDate') || undefined,
    capacity: searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    take: parseInt(searchParams.get('limit') || '12'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  }));

  const { data, isPending: isLoading, error } = useGetProperties(filters);

  // Update URL when filters change
  const handleFiltersChange = (newFilters: PropertySearchQueries) => {
    setIsFilterLoading(true);
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    
    const newUrl = params.toString() ? `/property?${params.toString()}` : '/property';
    router.push(newUrl);
    
    setTimeout(() => setIsFilterLoading(false), 500);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    router.push(`/property?${params.toString()}`);
  };

  const handleResetFilters = () => {
    const resetFilters = { 
      page: 1, 
      take: 12, 
      sortBy: 'createdAt', 
      sortOrder: 'desc' as const 
    };
    setFilters(resetFilters);
    router.push('/property');
  };

  // Update filters when URL changes (browser back/forward)
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || undefined,
      destination: searchParams.get('destination') || undefined,
      location: searchParams.get('location') || undefined,
      checkInDate: searchParams.get('checkInDate') || undefined,
      checkOutDate: searchParams.get('checkOutDate') || undefined,
      capacity: searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      take: parseInt(searchParams.get('limit') || '12'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };
    setFilters(newFilters);
  }, [searchParams]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Terjadi kesalahan memuat properti</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = filters.destination || filters.search || filters.checkInDate || filters.capacity;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ENHANCED: Search Summary */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Properti Tersedia</h1>
        
        {hasActiveFilters && (
          <div className="text-muted-foreground space-y-2">
            <p>
              Hasil pencarian untuk:
              {(filters.destination || filters.search) && (
                <span className="font-semibold"> {filters.destination || filters.search}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {filters.checkInDate && filters.checkOutDate && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  📅 {filters.checkInDate} - {filters.checkOutDate}
                </span>
              )}
              {filters.capacity && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                  👥 {filters.capacity} tamu
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FilterSheet 
            currentFilters={filters} 
            onFiltersChange={handleFiltersChange} 
          />
          
          {!isLoading && !isFilterLoading && data && (
            <p className="text-sm text-muted-foreground">
              Menampilkan {data.data?.length || 0} dari {data.meta?.total || 0} properti
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(isLoading || isFilterLoading) ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      ) : data && data.data && data.data.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {data.data.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                viewMode={viewMode} 
              />
            ))}
          </div>

          {data.meta && data.meta.total > data.meta.take && (
            <div className="mt-8 flex justify-center">
              <PaginationSection 
                meta={data.meta} 
                setPage={handlePageChange} 
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? "Tidak ada properti yang sesuai dengan kriteria pencarian"
              : "Tidak ada properti yang ditemukan"
            }
          </p>
          {hasActiveFilters && (
            <Button onClick={handleResetFilters}>
              Reset Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const PropertyListPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} viewMode="grid" />
          ))}
        </div>
      </div>
    }>
      <PropertyListContent />
    </Suspense>
  );
};

export default PropertyListPage;
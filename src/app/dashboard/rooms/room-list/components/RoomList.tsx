"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Bed, Users, DollarSign, Edit, Trash2, X, ArrowLeft, Building } from "lucide-react"
import type { Property } from "@/types/property"
import type { Room } from "@/types/room"
import PaginationSection from "@/components/PaginationSection"
import { toast } from "sonner"
import useGetTenantRooms from "../_hooks/useGetTenantRooms"
import useDeleteRoom from "../_hooks/useDeleteRoom"
import useGetPropertiesForTenant from "@/app/dashboard/property/property-list/_hooks/useGetPropertiesForTenant"

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function MyRooms() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [totalRooms, setTotalRooms] = useState(0)
  const itemsPerPage = 5
  const router = useRouter()

  // Debounce search input dengan delay 500ms
  const debouncedSearchQuery = useDebounce(searchInput, 500)

  // Get properties untuk dropdown
  const { data: propertiesData, isLoading: isLoadingProperties } = useGetPropertiesForTenant({
    take: 100, // Get all properties for dropdown
  })

  // Get rooms berdasarkan property yang dipilih
  const { data: roomsData, isLoading: isLoadingRooms, error: roomsError, refetch } = useGetTenantRooms({
    property: selectedProperty,
    name: debouncedSearchQuery,
    page: currentPage,
    take: itemsPerPage,
  })

  const { mutateAsync: deleteRoom, isPending: isDeleting } = useDeleteRoom()

  // Load properties data
  useEffect(() => {
    if (propertiesData) {
      console.log("Fetched properties:", propertiesData)
      setProperties(propertiesData.data)
    }
  }, [propertiesData])

  // Load rooms data
  useEffect(() => {
    if (roomsData) {
      console.log("Fetched rooms:", roomsData)
      setRooms(roomsData.data)
      setTotalRooms(roomsData.meta.total)
    }
  }, [roomsData])

  useEffect(() => {
    if (roomsError) {
      console.error("Error fetching rooms:", roomsError)
    }
  }, [roomsError])

  // Reset page ketika search query atau property berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedProperty])

  const totalPages = Math.max(1, Math.ceil(totalRooms / itemsPerPage))

  const handlePropertyChange = (propertySlug: string) => {
    setSelectedProperty(propertySlug)
    setSearchInput("") // Clear search when changing property
    setCurrentPage(1)
  }

  const handleEditRoom = (room: Room, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/dashboard/rooms/edit-room/${room.id}`)
  }

  const handleDeleteRoom = async (room: Room, event: React.MouseEvent) => {
    event.stopPropagation()

    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus room "${room.name}"? Tindakan ini tidak dapat dibatalkan.`
    )

    if (!isConfirmed) return

    try {
      await deleteRoom(room.id)
      toast.success("Room berhasil dihapus")
      refetch() // Refresh the list after successful deletion
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus room")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const clearSearch = () => {
    setSearchInput("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const getSelectedPropertyName = () => {
    const property = properties.find(p => p.slug === selectedProperty)
    return property?.title || ""
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Rooms</h1>
          </div>

          {/* Property Selection */}
          <div className="space-y-4 mb-6">
            <div className="w-full max-w-md">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Property *
              </label>
              <Select value={selectedProperty} onValueChange={handlePropertyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a property to view rooms" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProperties ? (
                    <SelectItem value="loading" disabled>
                      Loading properties...
                    </SelectItem>
                  ) : properties.length === 0 ? (
                    <SelectItem value="no-properties" disabled>
                      No properties found
                    </SelectItem>
                  ) : (
                    properties.map((property) => (
                      <SelectItem key={property.id} value={property.slug}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{property.title}</span>
                          <span className="text-xs text-muted-foreground">
                            • {property.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search Room (only show when property is selected) */}
            {selectedProperty && (
              <div className="relative w-full max-w-md">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground pl-10 pr-10 focus:border-primary focus:ring-primary"
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute top-1/2 right-2 h-6 w-6 p-0 -translate-y-1/2 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Search status indicators */}
            {selectedProperty && searchInput !== debouncedSearchQuery && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                <span>Searching...</span>
              </div>
            )}

            {selectedProperty && debouncedSearchQuery && (
              <div className="text-sm text-muted-foreground">
                Searching for: "<span className="font-medium">{debouncedSearchQuery}</span>"
                {totalRooms > 0 && (
                  <span> in {getSelectedPropertyName()} - {totalRooms} result{totalRooms > 1 ? 's' : ''} found</span>
                )}
              </div>
            )}

            {/* Selected property info */}
            {selectedProperty && !searchInput && (
              <div className="text-sm text-muted-foreground">
                Showing rooms for: <span className="font-medium text-foreground">{getSelectedPropertyName()}</span>
                {totalRooms > 0 && (
                  <span> - {totalRooms} room{totalRooms > 1 ? 's' : ''} total</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {!selectedProperty ? (
          <div className="text-center py-20">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Select a Property</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose one of your properties from the dropdown above to view and manage its rooms.
            </p>
          </div>
        ) : isLoadingRooms ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {debouncedSearchQuery 
                ? `Searching for "${debouncedSearchQuery}" in ${getSelectedPropertyName()}...` 
                : `Loading rooms for ${getSelectedPropertyName()}...`}
            </p>
          </div>
        ) : roomsError ? (
          <div className="text-center py-20 text-destructive">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Error Loading Rooms</h3>
              <p className="text-sm">Failed to fetch rooms: {roomsError.message}</p>
              <Button onClick={() => refetch()} className="mt-4 bg-primary hover:bg-primary/90">
                Retry
              </Button>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Bed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No rooms found</h3>
              <p className="text-muted-foreground">
                {debouncedSearchQuery 
                  ? `No rooms found for "${debouncedSearchQuery}" in ${getSelectedPropertyName()}` 
                  : `${getSelectedPropertyName()} doesn't have any rooms yet`}
              </p>
              {debouncedSearchQuery && (
                <Button 
                  variant="outline" 
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative w-full lg:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={room.images?.[0]?.url || room.roomImages?.[0]?.url || "/placeholder.svg"}
                      alt={room.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    {room.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{room.name}</h3>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            {room.capacity} guest{room.capacity > 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Bed className="mr-2 h-4 w-4 text-primary" />
                            {room.stock} room{room.stock > 1 ? 's' : ''} available
                          </div>
                        </div>

                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(room.price)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">/night</span>
                        </div>

                        {room.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description.length > 150
                              ? `${room.description.substring(0, 150)}...`
                              : room.description}
                          </p>
                        )}

                        {/* Facilities */}
                        {room.facilities && room.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {room.facilities.slice(0, 3).map((facility, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                              >
                                {facility.title}
                              </span>
                            ))}
                            {room.facilities.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                                +{room.facilities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Room #{String(room.id).slice(-6).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            Created: {new Date(room.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEditRoom(room, e)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteRoom(room, e)}
                            disabled={isDeleting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProperty && totalRooms > 0 && (
          <PaginationSection
            meta={{
              page: currentPage,
              take: itemsPerPage,
              total: totalRooms,
            }}
            setPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
"use client"

import type React from "react"
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Calendar, ChevronRight, Eye, Edit, Trash2, X, AlertTriangle, UserX, LogIn, User } from "lucide-react"
import type { Property } from "@/types/property"
import PaginationSection from "@/components/PaginationSection"
import { toast } from "sonner"
import useGetPropertiesForTenant from "../_hooks/useGetPropertiesForTenant"
import useDeleteProperty from "../_hooks/useDeleteProperty"

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

export default function MyProperties() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState("") // Input value untuk UI
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [properties, setProperties] = useState<Property[]>([])
  const [totalProperties, setTotalProperties] = useState(0)
  const itemsPerPage = 5
  const router = useRouter()
  const { data: session, status } = useSession()

  // Debounce search input dengan delay 500ms
  const debouncedSearchQuery = useDebounce(searchInput, 500)

  const { data, isLoading, error, refetch } = useGetPropertiesForTenant({
    search: debouncedSearchQuery, // Gunakan debounced value untuk API
    category,
    location,
    page: currentPage,
    take: itemsPerPage,
  })

  const { mutateAsync: deleteProperty, isPending: isDeleting } = useDeleteProperty()

  // Check authentication status
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Anda perlu login terlebih dahulu", {
        duration: 3000,
        action: {
          label: 'Login',
          onClick: () => router.push('/login')
        }
      })
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (data) {
      console.log("Fetched properties:", data)
      setProperties(data.data)
      setTotalProperties(data.meta.total)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.error("Error fetching properties:", error)
      
      // Show appropriate toast messages for different error types
      if (error.type === 'auth') {
        toast.error(error.message, {
          duration: 4000,
          action: {
            label: 'Login',
            onClick: () => router.push('/login')
          }
        })
      } else if (error.type === 'forbidden') {
        toast.error(error.message, {
          duration: 5000,
          action: {
            label: 'Login',
            onClick: () => router.push('/login')
          }
        })
      } else if (error.type === 'network') {
        toast.error(error.message, {
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => refetch()
          }
        })
      } else {
        toast.error(error.message, {
          duration: 4000,
          action: {
            label: 'Retry',
            onClick: () => refetch()
          }
        })
      }
    }
  }, [error, router, refetch])

  // Reset page ketika search query berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  const totalPages = Math.max(1, Math.ceil(totalProperties / itemsPerPage))

  const handleViewProperty = (property: Property, event: React.MouseEvent) => {
    event.stopPropagation()

    if (property.slug) {
      router.push(`/property/${property.slug}`)
    } else {
      router.push(`/property/${property.id}`)
    }
  }

  const handleEditProperty = (property: Property, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/dashboard/property/edit-property/${property.slug}`)
  }

  const handleDeleteProperty = async (property: Property, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!property.slug) {
      toast.error("Property slug not found")
      return
    }

    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus properti "${property.title}"? Tindakan ini tidak dapat dibatalkan.`
    )

    if (!isConfirmed) return

    try {
      await deleteProperty(property.slug)
      toast.success("Properti berhasil dihapus")
      refetch() // Refresh the list after successful deletion
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus properti")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 border-green-500/30 text-green-600"
      case "DRAFT":
        return "bg-blue-500/10 border-blue-500/30 text-blue-600"
      case "SOLD":
        return "bg-red-500/10 border-red-500/30 text-red-600"
      default:
        return "bg-muted/50 border-border text-muted-foreground"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active"
      case "DRAFT":
        return "Draft"
      case "SOLD":
        return "Sold"
      default:
        return status
    }
  }

  // Handle search input change (untuk UI responsiveness)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchInput("")
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!session?.user) return 'User'
    return session.user.name || session.user.email || `User #${session.user.id}`
  }

  // Get user role
  const getUserRole = () => {
    return session?.user?.role || 'Unknown'
  }

  // Render error states with improved UI
  const renderErrorState = () => {
    if (!error) return null

    if (error.type === 'auth' || error.type === 'forbidden') {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              {error.type === 'auth' ? (
                <LogIn className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              ) : (
                <UserX className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {error.type === 'auth' ? 'Login Diperlukan' : 'Akses Ditolak'}
            </h3>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {error.message}
            </p>

            {error.type === 'forbidden' && session?.user && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Current Role:</strong> {getUserRole()}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Required: <strong>TENANT</strong>
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Menuju Halaman Login
              </Button>
              
              {error.shouldRedirect && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 flex items-center justify-center">
                    <div className="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent mr-2" />
                    Mengalihkan ke halaman login...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-20 text-destructive">
        <div className="max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Properties</h3>
          <p className="text-sm mb-4">{error.message}</p>
          <div className="space-y-2">
            <Button onClick={() => refetch()} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="ml-2"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memverifikasi autentikasi...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Property List</h1>
            
            {/* User info */}
            {session?.user && (
              <div className="flex items-center gap-3" suppressHydrationWarning>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Role: {getUserRole()}
                  </div>
                </div>
                {session.user.pictureProfile ? (
                  <img 
                    src={session.user.pictureProfile} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search property..."
              className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground pl-10 pr-10 focus:border-primary focus:ring-primary"
              value={searchInput}
              onChange={handleSearchChange}
              disabled={error?.type === 'auth' || error?.type === 'forbidden'}
            />
            {/* Clear search button */}
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute top-1/2 right-2 h-6 w-6 p-0 -translate-y-1/2 hover:bg-transparent"
                disabled={error?.type === 'auth' || error?.type === 'forbidden'}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search status indicator */}
          {searchInput !== debouncedSearchQuery && !error && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              <span>Searching...</span>
            </div>
          )}

          {debouncedSearchQuery && !error && (
            <div className="mt-2 text-sm text-muted-foreground">
              Searching for: "<span className="font-medium">{debouncedSearchQuery}</span>"
              {totalProperties > 0 && (
                <span> - {totalProperties} result{totalProperties > 1 ? 's' : ''} found</span>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error ? renderErrorState() : isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {debouncedSearchQuery ? `Searching for "${debouncedSearchQuery}"...` : "Loading properties..."}
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                {debouncedSearchQuery 
                  ? `No properties found for "${debouncedSearchQuery}"` 
                  : "You haven't added any properties yet"
                }
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
            {properties.map((property) => (
              <div
                key={property.id}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative w-full lg:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={property.thumbnail || "/placeholder.svg"}
                      alt={property.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          {property.location}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          {property.city}
                        </div>

                        {property.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {property.description.length > 100
                              ? `${property.description.substring(0, 100)}...`
                              : property.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Property #{String(property.id).slice(-8).toUpperCase()}
                          </div>
                          {property.slug && <div className="text-xs text-muted-foreground/70">/{property.slug}</div>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleViewProperty(property, e)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEditProperty(property, e)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 hover:border-orange-300 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteProperty(property, e)}
                            disabled={isDeleting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg px-3 py-1 text-xs font-medium border ${getStatusColor(
                            property.status,
                          )}`}
                        >
                          {formatStatus(property.status)}
                        </div>

                        {property.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalProperties > 0 && !error && (
          <PaginationSection
            meta={{
              page: currentPage,
              take: itemsPerPage,
              total: totalProperties,
            }}
            setPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
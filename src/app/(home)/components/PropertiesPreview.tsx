"use client"

import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home } from "lucide-react"
import { Property } from "@/types/property"
import useGetProperties from "@/app/property/_hooks/useGetProperty"

function PropertyPreview() {
  // Fix: Use proper query parameters for your hook
  const { data: properties, isPending } = useGetProperties({ 
    take: 8,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const formatPrice = (property: Property) => {
    if (property.rooms && property.rooms.length > 0) {
      const minPrice = Math.min(...property.rooms.map(room => room.price))
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(minPrice)
    }
    return null
  }

  const getPropertyImage = (property: Property) => {
    // Use first image from images array, fallback to thumbnail, then placeholder
    return property.images?.[0]?.url || property.thumbnail || "/placeholder.svg?height=240&width=320&query=modern property"
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
            Properti Pilihan Terbaik
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Temukan berbagai pilihan penginapan terbaik dengan fasilitas lengkap dan harga terjangkau di seluruh
            Indonesia
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isPending
            ? // Loading skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Skeleton className="h-full w-full bg-muted/50" />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-full bg-muted/50" />
                    <Skeleton className="h-4 w-3/4 bg-muted/50" />
                    <Skeleton className="h-4 w-1/2 bg-muted/50" />
                    <Skeleton className="h-9 w-full bg-muted/50" />
                  </CardContent>
                </Card>
              ))
            : // Real property data
              properties?.data?.map((propertyItem) => {
                if (!propertyItem?.slug) return null

                const propertyPrice = formatPrice(propertyItem)
                const propertyImage = getPropertyImage(propertyItem)

                return (
                  <Link key={propertyItem.id} href={`/property/${propertyItem.slug}`} className="group block">
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 bg-card">
                      {/* Property Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                        <Image
                          src={propertyImage}
                          alt={propertyItem.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                        
                        {/* Category Badge - Updated to use PropertyCategory object */}
                        {propertyItem.category && propertyItem.category.isActive && (
                          <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm border-0 shadow-lg">
                            {propertyItem.category.name}
                          </Badge>
                        )}
                        
                        {/* Status Badge */}
                        {propertyItem.status === "DRAFT" && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-4 right-4 bg-yellow-500/90 text-white backdrop-blur-sm border-0 shadow-lg"
                          >
                            Draft
                          </Badge>
                        )}
                        {propertyItem.status === "SOLD" && (
                          <Badge 
                            variant="destructive" 
                            className="absolute top-4 right-4 bg-red-500/90 text-white backdrop-blur-sm border-0 shadow-lg"
                          >
                            Sold
                          </Badge>
                        )}
                        
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardContent className="p-6">
                        {/* Property Info */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 text-balance">
                              {propertyItem.title}
                            </h3>
                            
                            {/* Location with city and address */}
                            <div className="flex items-center text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                              <span className="truncate font-medium">
                                {propertyItem.city && propertyItem.location 
                                  ? `${propertyItem.city}, ${propertyItem.location}`
                                  : propertyItem.location || propertyItem.city || propertyItem.address
                                }
                              </span>
                            </div>
                          </div>

                          {propertyItem.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
                              {propertyItem.description}
                            </p>
                          )}

                          {/* Price Display */}
                          {propertyPrice && (
                            <div className="pt-2">
                              <p className="text-lg font-bold text-primary">
                                {propertyPrice}
                                <span className="text-sm font-normal text-muted-foreground">/malam</span>
                              </p>
                            </div>
                          )}

                          {/* Facilities Preview */}
                          {propertyItem.facilities && propertyItem.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {propertyItem.facilities.slice(0, 2).map((facility, facilityIndex) => (
                                <Badge 
                                  key={facility.id || facilityIndex} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {facility.title}
                                </Badge>
                              ))}
                              {propertyItem.facilities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{propertyItem.facilities.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* View Details Button */}
                          <div className="pt-2">
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 group-hover:shadow-lg"
                            >
                              Lihat Detail Properti
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
        </div>

        {/* Empty State */}
        {!isPending && (!properties?.data || properties.data.length === 0) && (
          <div className="text-center py-20">
            <div className="mx-auto w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Home className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Tidak Ada Properti Ditemukan</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
              Belum ada properti yang tersedia saat ini. Silakan cek kembali nanti untuk listing terbaru!
            </p>
          </div>
        )}

        {/* View All Button */}
        {!isPending && properties?.data && properties.data.length > 0 && (
          <div className="text-center mt-16">
            <Link href="/property">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 bg-transparent"
              >
                Lihat Semua Properti
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default PropertyPreview
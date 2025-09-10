"use client"

import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home } from "lucide-react"
import useGetProperties from "@/app/property/_hooks/useGetProperty"

function PropertyList() {
  const { data: properties, isPending } = useGetProperties()

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">Properti Pilihan Terbaik</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Temukan berbagai pilihan penginapan terbaik dengan fasilitas lengkap dan harga terjangkau di seluruh
            Indonesia
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isPending
            ? // Loading skeletons with enhanced PropertyRent theme
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
            : // Real property data with enhanced PropertyRent styling
              properties?.data?.map((property) => {
                if (!property?.slug) return null

                return (
                  <Link key={property.id} href={`/property/${property.slug}`} className="group block">
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 bg-card">
                      {/* Property Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                        <Image
                          src={property.thumbnail || "/placeholder.svg?height=240&width=320&query=modern property"}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                        {property.category && (
                          <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm border-0 shadow-lg">
                            {property.category}
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
                              {property.title}
                            </h3>
                            {property.location && (
                              <div className="flex items-center text-muted-foreground text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                <span className="truncate font-medium">{property.location}</span>
                              </div>
                            )}
                          </div>

                          {property.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed text-pretty">
                              {property.description}
                            </p>
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

export default PropertyList

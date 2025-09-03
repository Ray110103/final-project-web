"use client"

import type { FC } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useGetPropertyBySlug from "../_hooks/useGetPropertyBySlug"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Building, User, Hash, Clock, Navigation } from "lucide-react"

interface PropertyDetailsProps {
  slug: string
}

const PropertyDetails: FC<PropertyDetailsProps> = ({ slug }) => {
  const { data: property, isPending, isError } = useGetPropertyBySlug(slug)
  const router = useRouter()

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-64 md:h-96 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Properti Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-6">Properti yang Anda cari tidak ada atau telah dihapus.</p>
            <Button onClick={() => router.push("/property")} className="w-full">
              Kembali ke Daftar Properti
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={property.thumbnail || "/placeholder.svg?height=400&width=800&query=modern property exterior"}
            alt={property.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Category */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">{property.title}</h1>
                {property.category && (
                  <Badge variant="secondary" className="shrink-0">
                    <Building className="h-3 w-3 mr-1" />
                    {property.category}
                  </Badge>
                )}
              </div>

              {/* Location Details */}
              <div className="space-y-2">
                {property.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                )}

                {property.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="text-sm">Kota: {property.city}</span>
                  </div>
                )}

                {property.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Deskripsi Properti</h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Coordinates (if available) */}
            {property.latitude && property.longitude && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Lokasi Koordinat</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Latitude:</span>
                      <p className="font-mono text-foreground">{property.latitude}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitude:</span>
                      <p className="font-mono text-foreground">{property.longitude}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Property Info */}
          <div className="space-y-6">
            {/* Property Information Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Informasi Properti</h3>

                <div className="space-y-4">
                  {/* Created Date */}
                  {property.createdAt && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Dibuat</span>
                      </div>
                      <span className="text-sm text-foreground">
                        {new Date(property.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Updated Date */}
                  {property.updatedAt && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Diperbarui</span>
                      </div>
                      <span className="text-sm text-foreground">
                        {new Date(property.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Hubungi Pemilik
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    Simpan Properti
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => router.push("/property")}>
                    Kembali ke Daftar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails

"use client";

import type { FC } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Building,
  Navigation,
  Heart,
  Share2,
  Phone,
  Bookmark,
  Star,
  Users,
  Bed,
  Wifi,
  Bath,
  Home,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Property } from "@/types/property"
import { RoomImage } from "@/types/room"
import useGetPropertyBySlug from "../_hooks/useGetPropertyBySlug"

interface PropertyDetailsProps {
  slug: string
}

// Image Gallery Component
const ImageGallery = ({ images, title }: { images: RoomImage[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative">
      <div className="relative aspect-video w-full max-w-4xl mx-auto">
        <Image
          src={images[currentIndex]?.url || "/placeholder.svg"}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2 mt-4 max-w-4xl mx-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PropertyDetails: FC<PropertyDetailsProps> = ({ slug }) => {
  const { data: property, isPending, isError } = useGetPropertyBySlug(slug)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getMinPrice = () => {
    if (property?.rooms && property.rooms.length > 0) {
      return Math.min(...property.rooms.map(room => room.price))
    }
    return 0
  }

  const getMaxCapacity = () => {
    if (property?.rooms && property.rooms.length > 0) {
      return Math.max(...property.rooms.map(room => room.capacity || 2))
    }
    return 2
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-8">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg border-0 rounded-2xl">
          <CardContent className="text-center py-12">
            <Building className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Properti Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">Properti yang Anda cari tidak ada atau telah dihapus.</p>
            <Button onClick={() => router.push("/property")} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              Kembali ke Daftar Properti
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minPrice = getMinPrice()
  const maxCapacity = getMaxCapacity()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-balance">{property.title}</h1>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-semibold">4.8</span>
                <span className="text-gray-600">(124 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4" />
                <span className="underline hover:no-underline cursor-pointer">
                  {property.city && property.location 
                    ? `${property.city}, ${property.location}`
                    : property.location || property.city || property.address
                  }
                </span>
              </div>
              {property.category && (
                <Badge variant="outline" className="text-xs">
                  {property.category.name}
                </Badge>
              )}
              <Badge 
                variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {property.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-white rounded-xl">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-white rounded-xl">
              <Heart className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Property Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-12 rounded-2xl overflow-hidden">
          <div className="relative aspect-[4/3] lg:aspect-square">
            <Image
              src={property.images?.[0]?.url || property.thumbnail || "/placeholder.svg?height=600&width=600&query=modern luxury property exterior"}
              alt={property.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {property.images && property.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {property.images.slice(1, 5).map((img, index) => (
                <div key={img.id} className="relative aspect-square">
                  <Image
                    src={img.url || "/placeholder.svg"}
                    alt={`${property.title} - ${index + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {index === 3 && property.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                      <span className="text-white font-semibold">+{property.images.length - 5} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview */}
            <div className="pb-8 border-b border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {property.category?.name || 'Property'} in {property.city}
                  </h2>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{maxCapacity} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>{property.rooms?.length || 0} rooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      <span>{property.rooms?.length || 0} beds</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                  <Building className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About this place</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
              </div>
            )}

            {/* Facilities */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.facilities.map((facility) => (
                    <div key={facility.id || facility.title} className="flex items-center gap-4 py-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Wifi className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-800 font-medium">{facility.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            {property.rooms && property.rooms.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Where you'll sleep</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-white"
                    >
                      {room.images && room.images.length > 0 && (
                        <div className="relative aspect-[4/3] mb-4 rounded-xl overflow-hidden">
                          <Image
                            src={room.images[0].url || "/placeholder.svg"}
                            alt={room.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          
                          {/* View All Images Button */}
                          {room.images.length > 1 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white backdrop-blur-sm"
                                >
                                  <Camera className="h-4 w-4 mr-1" />
                                  {room.images.length}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{room.name} - All Images</DialogTitle>
                                </DialogHeader>
                                <ImageGallery images={room.images} title={room.name} />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}
                      
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{room.name}</h4>
                      {room.description && <p className="text-gray-600 mb-4 leading-relaxed">{room.description}</p>}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>1 bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.capacity || 2} guests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Stock: {room.stock}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(room.price)}
                          </span>
                          <span className="text-gray-600 text-sm">/night</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Where you'll be</h3>
              <div className="space-y-6">
                {property.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mt-1">
                      <Navigation className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{property.address}</p>
                      <p className="text-gray-600">{property.city}, {property.location}</p>
                    </div>
                  </div>
                )}
                {property.latitude && property.longtitude && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Coordinates</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-600 text-sm">Latitude</span>
                        <p className="font-mono text-gray-900 font-medium">{property.latitude}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Longitude</span>
                        <p className="font-mono text-gray-900 font-medium">{property.longtitude}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="shadow-xl border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(minPrice)}
                      </span>
                      <span className="text-gray-600">night</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-gray-600">(124)</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 border border-gray-300 rounded-xl overflow-hidden">
                      <div className="p-4 border-r border-gray-300">
                        <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Check-in</div>
                        <div className="text-sm text-gray-600 mt-1">Add date</div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Checkout</div>
                        <div className="text-sm text-gray-600 mt-1">Add date</div>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Guests</div>
                      <div className="text-sm text-gray-600 mt-1">1 guest</div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl mb-4"
                    size="lg"
                  >
                    Reserve
                  </Button>

                  <p className="text-center text-sm text-gray-600 mb-6">You won't be charged yet</p>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 underline">{formatPrice(minPrice)} x 5 nights</span>
                      <span className="font-medium">{formatPrice(minPrice * 5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 underline">Cleaning fee</span>
                      <span className="font-medium">{formatPrice(50000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 underline">Service fee</span>
                      <span className="font-medium">{formatPrice(70000)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total before taxes</span>
                      <span>{formatPrice(minPrice * 5 + 120000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-white bg-white rounded-xl font-medium"
                  size="lg"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-white bg-white rounded-xl font-medium"
                  size="lg"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save to Wishlist
                </Button>
              </div>

              <Card className="mt-6 border border-gray-200 rounded-2xl bg-white">
                <CardContent className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Property details</h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID</span>
                      <span className="text-gray-900 font-medium">#{property.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge 
                        variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    {property.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listed</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(property.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {property.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(property.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.push("/property")}
            className="text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl"
          >
            ← Back to listings
          </Button>
        </div>
      </div>

    </div>
  );
};

export default PropertyDetails
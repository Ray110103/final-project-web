"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, MapPin, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import useGetLocations from "../_hooks/useGetLocation"

interface SearchFilters {
  destination: string
  checkInDate: string
  checkOutDate: string
  capacity: number
}

interface SearchFiltersErrors {
  destination?: string
  checkInDate?: string
  checkOutDate?: string
  capacity?: string
}

interface LocationOption {
  location: string
  city: string
  count: number
}

const LandingSearchForm = () => {
  const router = useRouter()
  const { data: locations, isLoading: locationsLoading, error: locationsError } = useGetLocations()

  const [filters, setFilters] = useState<SearchFilters>({
    destination: "",
    checkInDate: "",
    checkOutDate: "",
    capacity: 1,
  })

  const [errors, setErrors] = useState<SearchFiltersErrors>({})
  const [isManualInput, setIsManualInput] = useState(false)

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  const validateForm = (): boolean => {
    const newErrors: SearchFiltersErrors = {}

    if (!filters.destination.trim()) {
      newErrors.destination = "Destinasi wajib dipilih"
    }

    if (!filters.checkInDate) {
      newErrors.checkInDate = "Tanggal check-in wajib diisi"
    }

    if (!filters.checkOutDate) {
      newErrors.checkOutDate = "Tanggal check-out wajib diisi"
    }

    if (filters.checkInDate && filters.checkOutDate) {
      const checkIn = new Date(filters.checkInDate)
      const checkOut = new Date(filters.checkOutDate)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)

      if (checkIn < todayDate) {
        newErrors.checkInDate = "Tanggal check-in tidak boleh di masa lalu"
      }

      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "Tanggal check-out harus setelah check-in"
      }

      // Validate minimum stay duration (optional)
      const daysDifference = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDifference < 1) {
        newErrors.checkOutDate = "Minimal menginap 1 malam"
      }
    }

    if (filters.capacity < 1) {
      newErrors.capacity = "Jumlah tamu minimal 1 orang"
    }

    if (filters.capacity > 20) {
      newErrors.capacity = "Jumlah tamu maksimal 20 orang"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildQueryParams = () => {
    const queryParams = new URLSearchParams()

    if (filters.destination && filters.destination.trim()) {
      queryParams.set("destination", filters.destination.trim())
    }

    if (filters.checkInDate) {
      queryParams.set("checkInDate", filters.checkInDate)
    }

    if (filters.checkOutDate) {
      queryParams.set("checkOutDate", filters.checkOutDate)
    }

    if (filters.capacity) {
      queryParams.set("capacity", filters.capacity.toString())
    }

    // Add flag to indicate this is a filtered search with availability check
    if (filters.checkInDate && filters.checkOutDate) {
      queryParams.set("availability", "true")
    }

    // Add search timestamp for cache busting
    queryParams.set("searchId", Date.now().toString())

    return queryParams
  }

  const handleSearch = async () => {
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field yang diperlukan")
      return
    }

    // Show loading toast
    const loadingToast = toast.loading("Mencari properti yang tersedia...")

    try {
      // Build query parameters with availability check
      const queryParams = buildQueryParams()

      // Add additional search parameters for better filtering
      if (filters.checkInDate && filters.checkOutDate) {
        // Calculate stay duration for better filtering
        const checkIn = new Date(filters.checkInDate)
        const checkOut = new Date(filters.checkOutDate)
        const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        queryParams.set("stayDuration", stayDuration.toString())
      }

      // Navigate to property listing page with availability filtering
      router.push(`/property?${queryParams.toString()}`)

      toast.dismiss(loadingToast)
      toast.success("Pencarian berhasil! Menampilkan properti yang tersedia.")
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Terjadi kesalahan saat mencari properti. Silakan coba lagi.")
      console.error("Search error:", error)
    }
  }

  const handleInputChange = (field: keyof SearchFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Auto-adjust check-out date if check-in is changed and check-out is before/same as check-in
    if (field === "checkInDate" && typeof value === "string" && filters.checkOutDate) {
      const checkInDate = new Date(value)
      const checkOutDate = new Date(filters.checkOutDate)

      if (checkOutDate <= checkInDate) {
        const nextDay = new Date(checkInDate)
        nextDay.setDate(nextDay.getDate() + 1)
        setFilters((prev) => ({
          ...prev,
          [field]: value,
          checkOutDate: nextDay.toISOString().split("T")[0],
        }))
      }
    }
  }

  const handleDestinationSelect = (value: string) => {
    if (value === "manual") {
      setIsManualInput(true)
      setFilters((prev) => ({ ...prev, destination: "" }))
    } else {
      setIsManualInput(false)
      handleInputChange("destination", value)
    }
  }

  const handleQuickDestinationSelect = (destination: string) => {
    handleInputChange("destination", destination)

    // Auto-focus to next field for better UX
    setTimeout(() => {
      const checkInInput = document.querySelector('input[type="date"]') as HTMLInputElement
      if (checkInInput) {
        checkInInput.focus()
      }
    }, 100)
  }

  // Popular destinations for quick selection
  const popularDestinations: LocationOption[] = locations && Array.isArray(locations) ? locations.slice(0, 5) : []

  // Calculate total properties
  const totalProperties =
    locations && Array.isArray(locations)
      ? locations.reduce((total: number, loc: LocationOption) => total + loc.count, 0)
      : 0

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Destination Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Destinasi *
            </Label>

            {!isManualInput ? (
              <>
                {locationsLoading ? (
                  <div className="h-12 rounded-lg border border-input bg-background px-4 py-3 text-muted-foreground flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Memuat lokasi...
                  </div>
                ) : locationsError ? (
                  <div className="h-12 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 flex items-center text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="text-red-600 hover:text-red-700 p-0 h-auto font-normal underline"
                    >
                      Error memuat lokasi. Klik untuk refresh.
                    </Button>
                  </div>
                ) : (
                  <Select value={filters.destination} onValueChange={handleDestinationSelect}>
                    <SelectTrigger className={`h-12 ${errors.destination ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Pilih destinasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations &&
                        Array.isArray(locations) &&
                        locations.map((location: LocationOption, index: number) => (
                          <SelectItem key={index} value={`${location.city}, ${location.location}`}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {location.city}, {location.location}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">({location.count} properti)</span>
                            </div>
                          </SelectItem>
                        ))}

                      {/* Manual input option */}
                      <SelectItem value="manual">
                        <span className="text-primary">✏️ Ketik lokasi lain...</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Ketik nama kota atau lokasi"
                  className={`h-12 ${errors.destination ? "border-red-500" : ""}`}
                  value={filters.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsManualInput(false)
                    setFilters((prev) => ({ ...prev, destination: "" }))
                  }}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  ← Kembali ke pilihan lokasi
                </Button>
              </div>
            )}

            {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
          </div>

          {/* Check-in Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Check-in *
            </Label>
            <Input
              type="date"
              value={filters.checkInDate}
              min={today}
              onChange={(e) => handleInputChange("checkInDate", e.target.value)}
              className={`h-12 ${errors.checkInDate ? "border-red-500" : ""}`}
            />
            {errors.checkInDate && <p className="text-xs text-red-500">{errors.checkInDate}</p>}
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Check-out *
            </Label>
            <Input
              type="date"
              value={filters.checkOutDate}
              min={filters.checkInDate || today}
              onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
              className={`h-12 ${errors.checkOutDate ? "border-red-500" : ""}`}
            />
            {errors.checkOutDate && <p className="text-xs text-red-500">{errors.checkOutDate}</p>}
          </div>

          {/* Guest Capacity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Tamu *
            </Label>
            <div className="flex">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.capacity}
                  onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 1)}
                  className={`h-12 pl-10 rounded-r-none ${errors.capacity ? "border-red-500" : ""}`}
                />
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={!filters.destination || !filters.checkInDate || !filters.checkOutDate}
                className="h-12 px-8 rounded-l-none bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-5 w-5 mr-2" />
                Cari
              </Button>
            </div>
            {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
          </div>
        </div>

        {/* Popular Destinations Quick Select */}
        {popularDestinations.length > 0 && !isManualInput && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3 font-medium">Destinasi populer:</p>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((location: LocationOption, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDestinationSelect(`${location.city}, ${location.location}`)}
                  className="text-xs hover:bg-primary hover:text-white border-gray-200 hover:border-primary transition-all"
                >
                  {location.city}
                  <span className="ml-1 text-xs opacity-70">({location.count})</span>
                </Button>
              ))}

              {locations && Array.isArray(locations) && locations.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80"
                  onClick={() => router.push("/property")}
                >
                  Lihat semua destinasi →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Search Stats */}
        {totalProperties > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              📍 Tersedia {totalProperties} properti di {locations?.length || 0} lokasi
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LandingSearchForm

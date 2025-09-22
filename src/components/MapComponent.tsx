"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet"
import { MapPin, Loader2 } from "lucide-react"
import type { LeafletMouseEvent } from "leaflet" // Import the event type

interface MapProps {
  onLocationChange: (lat: number, lng: number) => void
  style?: React.CSSProperties
}

const MapComponent = ({ onLocationChange, style }: MapProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) { // Add explicit type for the event parameter
        const { lat, lng } = e.latlng
        setSelectedPosition([lat, lng])
        onLocationChange(lat, lng)
      },
    })

    return selectedPosition ? <Marker position={selectedPosition} /> : null
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-muted/30 border border-border rounded-lg"
        style={style || { height: "400px", width: "100%" }}
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat peta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        <span>Klik pada peta untuk menentukan lokasi properti</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={13}
          style={style || { height: "400px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>

      {selectedPosition && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <MapPin className="h-4 w-4 text-primary" />
          <div className="text-sm">
            <span className="font-medium text-foreground">Lokasi terpilih: </span>
            <span className="text-muted-foreground">
              {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent
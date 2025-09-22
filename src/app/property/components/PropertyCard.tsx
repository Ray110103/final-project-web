// components/PropertyCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  viewMode: 'grid' | 'list';
}

const PropertyCard = ({ property, viewMode }: PropertyCardProps) => {
  const router = useRouter();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleViewDetail = () => {
    router.push(`/property/${property.slug}`);
  };

  const getMinPrice = () => {
    if (property.rooms && property.rooms.length > 0) {
      return Math.min(...property.rooms.map(room => room.price));
    }
    return 0;
  };

  const getMaxCapacity = () => {
    if (property.rooms && property.rooms.length > 0) {
      return Math.max(...property.rooms.map(room => room.capacity || 2));
    }
    return 2;
  };

  // Safe image URL getter with multiple fallbacks
  const getImageUrl = () => {
    // Check if images array exists and has items
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images[0]?.url || property.thumbnail || '/placeholder-property.jpg';
    }
    // Fallback to thumbnail
    return property.thumbnail || '/placeholder-property.jpg';
  };

  const cardClasses = viewMode === 'grid' 
    ? "overflow-hidden hover:shadow-lg transition-all cursor-pointer" 
    : "overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-row";

  const imageClasses = viewMode === 'grid'
    ? "w-full h-48 object-cover"
    : "w-80 h-48 object-cover";

  const contentClasses = viewMode === 'grid'
    ? "p-4"
    : "p-4 flex-1";

  return (
    <Card className={cardClasses} onClick={handleViewDetail}>
      <img
        src={getImageUrl()}
        alt={property.title || 'Property image'}
        className={imageClasses}
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
        }}
      />
      <div className={contentClasses}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.5</span>
            <span className="text-muted-foreground">(0)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {[property.city, property.location].filter(Boolean).join(', ') || 'Location not specified'}
          </span>
        </div>

        {property.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{getMaxCapacity()} tamu</span>
          </div>
          {property.category && (
            <Badge variant="outline" className="text-xs">
              {property.category.name}
            </Badge>
          )}
          {property.status && (
            <Badge 
              variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {property.status}
            </Badge>
          )}
        </div>

        {property.facilities && property.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.facilities.slice(0, 3).map((facility, facilityIndex) => (
              <Badge key={facility.id || facilityIndex} variant="secondary" className="text-xs">
                {facility.title}
              </Badge>
            ))}
            {property.facilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.facilities.length - 3} lainnya
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            {getMinPrice() > 0 ? (
              <>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(getMinPrice())}
                </span>
                <span className="text-sm text-muted-foreground">/malam</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Harga tidak tersedia</span>
            )}
          </div>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail();
            }}
          >
            Lihat Detail
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
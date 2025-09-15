// src/app/(user)/room-reservation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  MapPin,
  Star,
  Users,
  Bath,
  Bed,
  Wifi,
  Car,
  Home,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Property } from "@/types/property";
import {  Room } from "@/types/room";
import { Transaction } from "@/types/transaction";
import { useGetProperties } from "./_hooks/useProperties";
import { useGetRooms } from "./_hooks/useRooms";
import { createTransaction } from "@/app/dashboard/_services/transaction-service";

export default function RoomReservationPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [guestCount, setGuestCount] = useState(1);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { data: propertiesData, loading: propertiesLoading } =
    useGetProperties();

  useEffect(() => {
    if (propertiesData?.data) {
      setProperties(propertiesData.data);
    }
  }, [propertiesData]);

  // Filter properties based on search and city
  const filteredProperties = properties.filter(
    (property) =>
      (searchTerm === "" ||
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (cityFilter === "ALL" || property.city === cityFilter)
  );

  // Get unique cities for filter
  const cities = [...new Set(properties.map((property) => property.city))];

  // Handle property selection
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    // In a real app, we would fetch rooms for this property
    // For now, we'll use dummy data
    setRooms([
      {
        id: 1,
        name: "Standard Room",
        stock: 5,
        capacity: 2,
        price: 750000,
        description: "Comfortable room with basic amenities",
        propertyId: property.id,
        property: property,
      },
      {
        id: 2,
        name: "Deluxe Room",
        stock: 3,
        capacity: 3,
        price: 1200000,
        description: "Spacious room with premium amenities",
        propertyId: property.id,
        property: property,
      },
      {
        id: 3,
        name: "Suite",
        stock: 2,
        capacity: 4,
        price: 2000000,
        description: "Luxury suite with separate living area",
        propertyId: property.id,
        property: property,
      },
    ]);
  };

  // Handle room selection
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingDialogOpen(true);
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedProperty || !selectedRoom || !checkInDate || !checkOutDate) {
      setToastMessage({
        message: "Please complete all required fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total price
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = selectedRoom.price * nights;

      // Create transaction
      const transactionData = {
        roomId: selectedRoom.id,
        qty: 1,
        startDate: checkInDate.toISOString(),
        endDate: checkOutDate.toISOString(),
        paymentMethod: "MANUAL_TRANSFER" as "MANUAL_TRANSFER" | "PAYMENT_GATEWAY",
      };

      const response = await createTransaction(transactionData);

      setToastMessage({
        message: "Booking successful! Please complete your payment.",
        type: "success",
      });

      // Close dialogs
      setIsBookingDialogOpen(false);
      setIsConfirmDialogOpen(false);

      // Reset selections
      setSelectedProperty(null);
      setSelectedRoom(null);
    } catch (error) {
      console.error("Error creating booking:", error);
      setToastMessage({
        message: "Failed to create booking. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Room Reservation</h1>
        <p className="text-muted-foreground">
          Find and book the perfect accommodation for your stay.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-md ${
            toastMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search properties..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property List */}
      {selectedProperty ? (
        // Room Selection View
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Rooms at {selectedProperty.title}
            </h2>
            <Button variant="outline" onClick={() => setSelectedProperty(null)}>
              Back to Properties
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Home className="h-12 w-12 text-gray-400" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{room.capacity}</Badge>
                    <Badge variant="secondary">Stock: {room.stock}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Price per night
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(room.price)}
                      </p>
                    </div>
                    <Button onClick={() => handleSelectRoom(room)}>
                      Select Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // Property List View
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                No properties found matching your criteria
              </p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 relative">
                  {property.thumbnail ? (
                    <img
                      src={property.thumbnail}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        property.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Starting from
                      </p>
                      <p className="text-lg font-bold">
                        {property.rooms && property.rooms.length > 0
                          ? formatCurrency(
                              Math.min(...property.rooms.map((r) => r.price))
                            )
                          : formatCurrency(0)}
                      </p>
                    </div>
                    <Button onClick={() => handleSelectProperty(property)}>
                      View Rooms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Review your booking details and confirm your reservation.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && selectedRoom && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                  <Home className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedProperty.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Check-in Date</label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(checkInDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Check-out Date</label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(checkOutDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Guests</label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {guestCount} Guest{guestCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Room Price</label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <span className="font-medium">
                      {formatCurrency(selectedRoom.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per night
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedRoom.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Service fee</span>
                  <span>{formatCurrency(50000)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(selectedRoom.price + 50000)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">
                      Payment Information
                    </h4>
                    <p className="text-sm text-blue-700">
                      After confirming your booking, you will need to complete
                      the payment within 1 hour. You can upload your payment
                      proof on the order page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this booking? You will need to
              complete the payment within 1 hour.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && selectedRoom && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Property:</span>
                <span>{selectedProperty.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Room:</span>
                <span>{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-in:</span>
                <span>{formatDate(checkInDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Check-out:</span>
                <span>{formatDate(checkOutDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold">
                  {formatCurrency(selectedRoom.price + 50000)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              No, Go Back
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isLoading}>
              {isLoading ? "Processing..." : "Yes, Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { Property } from "@/types/property";
import { Room } from "@/types/room";
import useGetRoomsByProperty from "../_hooks/useGetRoomsByProperty";
import { axiosInstance } from "@/lib/axios";
import { 
  Building2, 
  Bed, 
  Calendar, 
  MessageSquare, 
  Ban, 
  CalendarX, 
  Trash2,
  Plus,
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import useGetPropertiesForTenant from "@/app/dashboard/property/property-list/_hooks/useGetPropertiesForTenant";

interface BlockRoomValues {
  property: string;
  room: string;
  dates: string[];
  reason: string;
}

const validationSchema = Yup.object().shape({
  property: Yup.string().required("Property is required"),
  room: Yup.string().required("Room is required"),
  dates: Yup.array()
    .of(Yup.string())
    .min(1, "At least one date is required"),
  reason: Yup.string().required("Reason is required"),
});

const RoomAvailabilityManagement = () => {
  const { data: session } = useSession();
  
  // Use the tenant-specific properties hook
  const { 
    data: propertiesResponse, 
    isLoading: loadingProperties, 
    error: propertiesError,
    refetch: refetchProperties
  } = useGetPropertiesForTenant();
  
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string | null>(null);
  
  // Use improved rooms hook with better error handling
  const { 
    rooms, 
    loading: loadingRooms, 
    error: roomsError, 
    refetchRooms,
    isEmpty,
    isNetworkError,
    isAuthError,
    isServerError,
    isForbiddenError
  } = useGetRoomsByProperty(selectedPropertySlug || "");
  
  const [submitting, setSubmitting] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState("");

  // Extract properties from response
  const properties = propertiesResponse?.data || [];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const addDate = () => {
    if (currentDate && !selectedDates.includes(currentDate)) {
      if (currentDate < today) {
        toast.error("Cannot select dates in the past");
        return;
      }
      setSelectedDates([...selectedDates, currentDate].sort());
      setCurrentDate("");
    }
  };

  const removeDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(date => date !== dateToRemove));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (values: BlockRoomValues, { resetForm }: any) => {
    if (!session?.user.accessToken) {
      toast.error("Please log in to continue");
      return;
    }

    setSubmitting(true);
    
    try {
      const requests = selectedDates.map(date => {
        return axiosInstance.post("/rooms/non-availability", {
          roomId: parseInt(values.room),
          date: date,
          reason: values.reason,
        });
      });

      const results = await Promise.allSettled(requests);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Successfully blocked ${successful} date(s) for the room`);
        resetForm();
        setSelectedDates([]);
        setSelectedPropertySlug(null);
        
        if (selectedPropertySlug) {
          refetchRooms(selectedPropertySlug);
        }
      }

      if (failed > 0) {
        const firstError = results.find(result => result.status === 'rejected') as PromiseRejectedResult;
        const errorMessage = (firstError.reason as any)?.response?.data?.message || "Some dates failed to block";
        toast.error(`${failed} date(s) failed to block: ${errorMessage}`);
      }
      
    } catch (err: any) {
      console.error("Error blocking room dates:", err);
      
      if (err.response?.status === 404) {
        toast.error("Room not found or you don't have access to this room");
      } else if (err.response?.status === 403) {
        toast.error("Access denied - you don't have permission to modify this room");
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to block room dates";
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Enhanced error rendering for rooms
  const renderRoomsError = () => {
    if (!roomsError || !selectedPropertySlug) return null;

    if (isEmpty) {
      return (
        <Card className="p-6 mb-6 border-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <Bed className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 mb-1">No Rooms Available</h3>
              <p className="text-sm text-amber-700 mb-3">
                {roomsError.message}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRooms(selectedPropertySlug)}
                  className="border-amber-500 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/dashboard/rooms/create';
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (isAuthError) {
      return (
        <Card className="p-6 mb-6 border-destructive bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive mb-1">Authentication Error</h3>
              <p className="text-sm text-destructive/80">
                {roomsError.message}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    if (isForbiddenError) {
      return (
        <Card className="p-6 mb-6 border-orange-500 bg-orange-50">
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-800 mb-1">Access Denied</h3>
              <p className="text-sm text-orange-700">
                {roomsError.message}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    if (isNetworkError) {
      return (
        <Card className="p-6 mb-6 border-blue-500 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 mb-1">Connection Error</h3>
              <p className="text-sm text-blue-700 mb-3">
                {roomsError.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRooms(selectedPropertySlug)}
                className="border-blue-500 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    if (isServerError) {
      return (
        <Card className="p-6 mb-6 border-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 mb-1">Server Error</h3>
              <p className="text-sm text-red-700 mb-3">
                {roomsError.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRooms(selectedPropertySlug)}
                className="border-red-500 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 mb-6 border-gray-500 bg-gray-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">Unknown Error</h3>
            <p className="text-sm text-gray-700 mb-3">
              {roomsError.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchRooms(selectedPropertySlug)}
              className="border-gray-500 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Enhanced error rendering for properties
  const renderPropertiesError = () => {
    if (!propertiesError) return null;

    return (
      <Card className="p-6 mb-6 border-destructive bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive mb-1">
              {propertiesError.type === 'auth' ? 'Authentication Error' :
               propertiesError.type === 'forbidden' ? 'Access Denied' :
               propertiesError.type === 'network' ? 'Network Error' :
               propertiesError.type === 'server' ? 'Server Error' :
               'Unknown Error'}
            </h3>
            <p className="text-sm text-destructive/80 mb-3">
              {propertiesError.message}
            </p>
            {(propertiesError.type === 'network' || propertiesError.type === 'server') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchProperties()}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Handle session loading state
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user.accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to manage room availability.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-6">
              <CalendarX className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Room Availability Management
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Block specific dates for your rooms to manage availability and prevent bookings
            </p>
          </div>

          {/* Error Messages */}
          {renderPropertiesError()}
          {renderRoomsError()}

          {/* Show loading state for properties */}
          {loadingProperties && (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm">Loading your properties...</p>
              </div>
            </Card>
          )}

          {/* Show message if no properties and not loading */}
          {!loadingProperties && properties.length === 0 && !propertiesError && (
            <Card className="p-8 mb-6 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to create a property first before managing room availability.
              </p>
              <Button
                variant="outline"
                onClick={() => refetchProperties()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </Card>
          )}

          {/* Main Form - only show if we have properties */}
          {!loadingProperties && properties.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
              <Formik
                initialValues={{
                  property: "",
                  room: "",
                  dates: [],
                  reason: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, values, resetForm }) => {
                  // Update dates in formik when selectedDates changes
                  React.useEffect(() => {
                    setFieldValue("dates", selectedDates);
                  }, [selectedDates, setFieldValue]);

                  return (
                    <Form className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Property Selection */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="property"
                            className="text-sm font-semibold text-foreground flex items-center gap-2"
                          >
                            <Building2 className="w-4 h-4 text-primary" />
                            Property * 
                            <span className="text-xs text-muted-foreground font-normal">
                              ({properties.length} available)
                            </span>
                          </Label>
                          <Field name="property">
                            {({ field, form }: any) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  form.setFieldValue("property", value);
                                  form.setFieldValue("room", "");
                                  setSelectedPropertySlug(value);
                                }}
                              >
                                <SelectTrigger className="h-12 bg-background/50 border-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                  <SelectValue placeholder="Select Property" />
                                </SelectTrigger>
                                <SelectContent>
                                  {properties.map((property: Property) => (
                                    <SelectItem key={property.id} value={property.slug}>
                                      <div className="flex items-center gap-2">
                                        <span>{property.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {property.city}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </Field>
                          <ErrorMessage
                            name="property"
                            component="div"
                            className="text-sm text-destructive flex items-center gap-1"
                          />
                        </div>

                        {/* Room Selection */}
                        <div className="space-y-3">
                          <Label htmlFor="room" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Bed className="w-4 h-4 text-primary" />
                            Room *
                            {rooms.length > 0 && (
                              <span className="text-xs text-muted-foreground font-normal">
                                ({rooms.length} available)
                              </span>
                            )}
                          </Label>
                          <Field name="room">
                            {({ field, form }: any) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => form.setFieldValue("room", value)}
                                disabled={!selectedPropertySlug || loadingRooms || isEmpty}
                              >
                                <SelectTrigger className="h-12 bg-background/50 border-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                  <SelectValue
                                    placeholder={
                                      !selectedPropertySlug
                                        ? "Select property first"
                                        : loadingRooms
                                          ? "Loading rooms..."
                                          : isEmpty
                                            ? "No rooms available - create a room first"
                                            : rooms.length === 0
                                              ? "No rooms available"
                                              : "Select Room"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {rooms.map((room: Room) => (
                                    <SelectItem key={room.id} value={String(room.id)}>
                                      <div className="flex items-center gap-2">
                                        <span>{room.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          Capacity: {room.capacity}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </Field>
                          <ErrorMessage
                            name="room"
                            component="div"
                            className="text-sm text-destructive flex items-center gap-1"
                          />
                          
                          {/* Helper text for empty state */}
                          {isEmpty && (
                            <p className="text-xs text-muted-foreground">
                              This property needs at least one room before you can manage availability.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Block Dates *
                        </Label>
                        
                        <div className="flex gap-3">
                          <Input
                            type="date"
                            value={currentDate}
                            min={today}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="h-12 bg-background/50 border-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                          <Button
                            type="button"
                            onClick={addDate}
                            disabled={!currentDate}
                            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Date
                          </Button>
                        </div>

                        {/* Selected Dates Display */}
                        {selectedDates.length > 0 && (
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <CalendarX className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">
                                Selected Dates ({selectedDates.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedDates.map((date) => (
                                <Badge
                                  key={date}
                                  variant="secondary"
                                  className="flex items-center gap-2 py-1 px-3"
                                >
                                  <span className="text-xs">{formatDate(date)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeDate(date)}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        )}

                        <ErrorMessage
                          name="dates"
                          component="div"
                          className="text-sm text-destructive flex items-center gap-1"
                        />
                      </div>

                      {/* Reason */}
                      <div className="space-y-3">
                        <Label htmlFor="reason" className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Reason for Blocking *
                        </Label>
                        <Field
                          name="reason"
                          as={Textarea}
                          placeholder="Enter reason for blocking these dates (e.g., maintenance, renovation, personal use)"
                          className="min-h-[100px] bg-background/50 border-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                        <ErrorMessage
                          name="reason"
                          component="div"
                          className="text-sm text-destructive flex items-center gap-1"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-center pt-8 border-t border-border">
                        <Button
                          type="submit"
                          disabled={submitting || selectedDates.length === 0 || isEmpty}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-12 py-4 h-auto font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                              Processing {selectedDates.length} date(s)...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Ban className="w-5 h-5" />
                              Block {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </Button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomAvailabilityManagement;
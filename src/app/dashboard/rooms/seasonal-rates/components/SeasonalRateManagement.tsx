"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
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
import { Property } from "@/types/property";
import { Room } from "@/types/room";
import { SeasonalRate } from "@/types/seasonal-rate";
import {
  Building2,
  Bed,
  Calendar,
  MessageSquare,
  TrendingUp,
  CalendarClock,
  Trash2,
  Plus,
  RefreshCw,
  Edit,
  DollarSign,
  Percent,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import useGetPropertiesForTenant from "@/app/dashboard/property/property-list/_hooks/useGetPropertiesForTenant";
import useGetRoomsByProperty from "../../rooms-availability/_hooks/useGetRoomsByProperty";
import { useGetSeasonalRates } from "../_hooks/useGetSeasonalRates";
import { useCreateSeasonalRate } from "../_hooks/useCreateSeasonalRate";
import { useUpdateSeasonalRate } from "../_hooks/useUpdateSeasonalRate";
import { useDeleteSeasonalRate } from "../_hooks/useDeleteSeasonalRate";

interface SeasonalRateValues {
  property: string;
  room: string;
  startDate: string;
  endDate: string;
  adjustmentType: "PERCENTAGE" | "NOMINAL"; // Match backend
  adjustmentValue: string;
  reason: string;
}

const validationSchema = Yup.object().shape({
  property: Yup.string().required("Property is required"),
  room: Yup.string().required("Room is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string()
    .required("End date is required")
    .test("is-after-start", "End date must be after start date", function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value) > new Date(startDate);
    }),
  adjustmentType: Yup.string()
    .oneOf(["PERCENTAGE", "NOMINAL"]) // Match backend enum
    .required("Adjustment type is required"),
  adjustmentValue: Yup.number()
    .required("Adjustment value is required")
    .min(0.01, "Adjustment value must be greater than 0"),
  reason: Yup.string().required("Reason is required"),
});

const SeasonalRateManagement = () => {
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [editingRate, setEditingRate] = useState<SeasonalRate | null>(null);

  // API hooks
  const {
    data: propertiesResponse,
    isLoading: loadingProperties,
    error: propertiesError,
    refetch: refetchProperties,
  } = useGetPropertiesForTenant();

  const {
    rooms,
    loading: loadingRooms,
    error: roomsError,
    refetchRooms,
    isEmpty,
  } = useGetRoomsByProperty(selectedPropertySlug || "");

  const {
    data: seasonalRatesResponse,
    isLoading: loadingRates,
    error: ratesError,
    refetch: refetchRates,
  } = useGetSeasonalRates({
    roomId: selectedRoomId || undefined,
    take: 20,
    page: 1,
  });

  const createSeasonalRate = useCreateSeasonalRate();
  const updateSeasonalRate = useUpdateSeasonalRate();
  const deleteSeasonalRate = useDeleteSeasonalRate();

  // Extract data safely
  const properties = propertiesResponse?.data || [];
  const seasonalRates = seasonalRatesResponse?.data || [];
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (values: SeasonalRateValues, { resetForm, setSubmitting }: any) => {
    try {
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Raw form values:", values);
      
      if (editingRate) {
        // Update logic
        const updatePayload = {
          startDate: values.startDate,
          endDate: values.endDate,
          adjustmentType: values.adjustmentType,
          adjustmentValue: String(values.adjustmentValue), // Force string conversion
          reason: values.reason || "",
        };
        
        console.log("UPDATE PAYLOAD:", JSON.stringify(updatePayload, null, 2));
        
        await updateSeasonalRate.mutateAsync({
          id: editingRate.id,
          payload: updatePayload,
        });
        toast.success("Seasonal rate updated successfully");
        setEditingRate(null);
      } else {
        // Create logic - sama seperti payload yang berhasil di Postman
        const createPayload = {
          roomId: String(values.room), // Force string conversion
          startDate: values.startDate,
          endDate: values.endDate,
          adjustmentType: values.adjustmentType,
          adjustmentValue: String(values.adjustmentValue), // Force string conversion
          reason: values.reason || undefined,
        };
        
        console.log("CREATE PAYLOAD:", JSON.stringify(createPayload, null, 2));
        
        // Basic validation
        if (!createPayload.roomId || !createPayload.startDate || !createPayload.endDate || !createPayload.adjustmentValue) {
          toast.error("Please fill all required fields");
          setSubmitting(false);
          return;
        }
        
        await createSeasonalRate.mutateAsync(createPayload);
        toast.success("Seasonal rate created successfully");
      }
      
      resetForm();
      refetchRates();
    } catch (error: any) {
      console.error("Submit error:", error);
      // Error akan ditangani oleh hook onError
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rateId: number) => {
    if (!confirm("Are you sure you want to delete this seasonal rate?")) return;
    
    try {
      await deleteSeasonalRate.mutateAsync(rateId);
      toast.success("Seasonal rate deleted successfully");
      refetchRates();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (rate: SeasonalRate) => {
    setEditingRate(rate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAdjustedPrice = (basePrice: number, rate: SeasonalRate) => {
    if (rate.adjustmentType === "PERCENTAGE") {
      return basePrice * (1 + rate.adjustmentValue / 100);
    } else {
      // NOMINAL = fixed amount adjustment
      return basePrice + rate.adjustmentValue;
    }
  };

  const isLoading = createSeasonalRate.isPending || updateSeasonalRate.isPending || deleteSeasonalRate.isPending;

  // Error components
  const renderPropertiesError = () => {
    if (!propertiesError) return null;

    return (
      <Card className="p-6 mb-6 border-destructive bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive mb-1">Error Loading Properties</h3>
            <p className="text-sm text-destructive/80 mb-3">
              {propertiesError?.message || "Failed to load properties"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchProperties()}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  };

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
                {roomsError.message || "This property has no rooms"}
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
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  // Loading state
  if (loadingProperties) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p>Loading properties...</p>
          </div>
        </main>
      </div>
    );
  }

  // No properties state
  if (properties.length === 0 && !propertiesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              Create a property first before managing seasonal rates.
            </p>
            <Button variant="outline" onClick={() => refetchProperties()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Seasonal Rate Management</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Set special pricing for peak seasons, holidays, and events to maximize your revenue
            </p>
          </div>

          {/* Error Messages */}
          {renderPropertiesError()}
          {renderRoomsError()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <CalendarClock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {editingRate ? "Edit Seasonal Rate" : "Create Seasonal Rate"}
                </h2>
              </div>

              <Formik
                initialValues={{
                  property: editingRate?.room?.property?.id?.toString() || "",
                  room: editingRate?.roomId?.toString() || "",
                  startDate: editingRate?.startDate?.split("T")[0] || "",
                  endDate: editingRate?.endDate?.split("T")[0] || "",
                  adjustmentType: editingRate?.adjustmentType || "PERCENTAGE",
                  adjustmentValue: editingRate?.adjustmentValue?.toString() || "",
                  reason: editingRate?.reason || "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ setFieldValue, values, resetForm, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Property Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="property" className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Property *
                      </Label>
                      <Field name="property">
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              form.setFieldValue("property", value);
                              form.setFieldValue("room", "");
                              setSelectedRoomId("");
                              const selectedProperty = properties.find((p) => p.id.toString() === value);
                              setSelectedPropertySlug(selectedProperty?.slug || "");
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select Property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property: Property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
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
                      <ErrorMessage name="property" component="div" className="text-sm text-destructive" />
                    </div>

                    {/* Room Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="room" className="text-sm font-semibold flex items-center gap-2">
                        <Bed className="w-4 h-4 text-primary" />
                        Room *
                      </Label>
                      <Field name="room">
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              form.setFieldValue("room", value);
                              setSelectedRoomId(value);
                            }}
                            disabled={!selectedPropertySlug || loadingRooms || isEmpty || isLoading}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue
                                placeholder={
                                  !selectedPropertySlug
                                    ? "Select property first"
                                    : loadingRooms
                                    ? "Loading rooms..."
                                    : "Select Room"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map((room: Room) => (
                                <SelectItem key={room.id} value={room.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <span>{room.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {formatCurrency(room.price)}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="room" component="div" className="text-sm text-destructive" />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="startDate" className="text-sm font-semibold">
                          Start Date *
                        </Label>
                        <Field
                          name="startDate"
                          type="date"
                          min={today}
                          disabled={isLoading}
                          className="h-12 w-full px-3 border border-input bg-background rounded-md disabled:opacity-50"
                        />
                        <ErrorMessage name="startDate" component="div" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="endDate" className="text-sm font-semibold">
                          End Date *
                        </Label>
                        <Field
                          name="endDate"
                          type="date"
                          min={values.startDate || today}
                          disabled={isLoading}
                          className="h-12 w-full px-3 border border-input bg-background rounded-md disabled:opacity-50"
                        />
                        <ErrorMessage name="endDate" component="div" className="text-sm text-destructive" />
                      </div>
                    </div>

                    {/* Adjustment Type */}
                    <div className="space-y-3">
                      <Label htmlFor="adjustmentType" className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Adjustment Type *
                      </Label>
                      <Field name="adjustmentType">
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => form.setFieldValue("adjustmentType", value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">
                                <div className="flex items-center gap-2">
                                  <Percent className="w-4 h-4" />
                                  Percentage
                                </div>
                              </SelectItem>
                              <SelectItem value="NOMINAL">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  Fixed Amount
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="adjustmentType" component="div" className="text-sm text-destructive" />
                    </div>

                    {/* Adjustment Value */}
                    <div className="space-y-3">
                      <Label htmlFor="adjustmentValue" className="text-sm font-semibold">
                        Adjustment Value *
                      </Label>
                      <Field
                        name="adjustmentValue"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={values.adjustmentType === "PERCENTAGE" ? "25 (for 25%)" : "50000"}
                        disabled={isLoading}
                        className="h-12 w-full px-3 border border-input bg-background rounded-md disabled:opacity-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        {values.adjustmentType === "PERCENTAGE"
                          ? "Enter percentage value (e.g., 25 for 25% increase)"
                          : "Enter fixed amount in IDR (e.g., 50000 for Rp 50,000 increase)"}
                      </p>
                      <ErrorMessage name="adjustmentValue" component="div" className="text-sm text-destructive" />
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                      <Label htmlFor="reason" className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Reason *
                      </Label>
                      <Field
                        name="reason"
                        as={Textarea}
                        placeholder="Enter reason for this seasonal rate (e.g., Holiday Season, Peak Season, Special Event)"
                        disabled={isLoading}
                        className="min-h-[80px] resize-none disabled:opacity-50"
                      />
                      <ErrorMessage name="reason" component="div" className="text-sm text-destructive" />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isLoading || isSubmitting} className="flex-1 h-12">
                        {isLoading || isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            {editingRate ? "Updating..." : "Creating..."}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {editingRate ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingRate ? "Update Rate" : "Create Rate"}
                          </div>
                        )}
                      </Button>

                      {editingRate && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingRate(null);
                            resetForm();
                          }}
                          disabled={isLoading}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Right Column - Seasonal Rates List */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Existing Seasonal Rates</h2>
                </div>
                {selectedRoomId && (
                  <Button variant="outline" size="sm" onClick={() => refetchRates()} disabled={loadingRates}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {!selectedRoomId ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">Select a Room</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a room from the form to view its seasonal rates
                  </p>
                </div>
              ) : loadingRates ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading seasonal rates...</p>
                </div>
              ) : seasonalRates.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">No Seasonal Rates</h3>
                  <p className="text-sm text-muted-foreground">
                    This room doesn't have any seasonal rates yet. Create one using the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {seasonalRates.map((rate) => (
                    <Card key={rate.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={rate.adjustmentType === "PERCENTAGE" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {rate.adjustmentType === "PERCENTAGE"
                                ? `+${rate.adjustmentValue}%`
                                : `+${formatCurrency(rate.adjustmentValue)}`}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(rate.startDate)} - {formatDate(rate.endDate)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rate.reason}</p>
                          {rate.room && (
                            <div className="text-xs text-muted-foreground">
                              Base: {formatCurrency(rate.room.price)} → Adjusted:{" "}
                              {formatCurrency(calculateAdjustedPrice(rate.room.price, rate))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(rate)} disabled={isLoading}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rate.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeasonalRateManagement;
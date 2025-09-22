"use client"

import { useEffect, useState } from "react"
import { Formik, Field, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, X, ArrowLeft, Bed, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import useUpdateRoom from "../_hooks/useUpdateRoom"
import { axiosInstance } from "@/lib/axios"
import useGetRoomForEdit from "../_hooks/useGetRoomForEditHook"

interface RoomFormValues {
  name: string
  capacity: string
  price: string
  description: string
  property: string
  limit: string
  images: File[]
  facilities: { title: string }[]
}

interface PropertyOption {
  id: string | number
  title: string
  slug: string
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Room name is required"),
  capacity: Yup.string()
    .matches(/^\d+$/, "Capacity must be a number")
    .required("Capacity is required"),
  price: Yup.string()
    .matches(/^\d+$/, "Price must be a number")
    .required("Price is required"),
  description: Yup.string().required("Description is required"),
  property: Yup.string().required("Property is required"),
  limit: Yup.string()
    .matches(/^\d+$/, "Stock must be a number")
    .required("Stock is required"),
  facilities: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required("Facility name is required"),
      })
    )
    .min(1, "At least one facility is required"),
})

interface UpdateRoomProps {
  roomId: string
}

const UpdateRoom = ({ roomId }: UpdateRoomProps) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)

  // Hooks
  const { mutateAsync: updateRoom, isPending } = useUpdateRoom()
  const { data: room, isLoading: loadingRoom, error: roomError } = useGetRoomForEdit(roomId)

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axiosInstance.get("/property/tenant/properties", {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        })
        const propertiesData = res.data.data ?? res.data
        setProperties(Array.isArray(propertiesData) ? propertiesData : [])
      } catch (error) {
        console.error("Failed to fetch properties", error)
        setProperties([])
      } finally {
        setLoadingProperties(false)
      }
    }

    if (session?.user.accessToken) {
      fetchProperties()
    }
  }, [session])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  // Loading state
  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <Card className="border-border shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <div className="space-y-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 bg-destructive/10 rounded-xl">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Room Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                The room you're trying to edit could not be found or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.push("/dashboard/room")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rooms
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 p-8 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bed className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Edit <span className="text-primary">Room</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Update room details: {room.name}
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              Current price: {formatCurrency(room.price)} • Capacity: {room.capacity} guests • Stock: {room.stock} rooms
            </div>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Room Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Formik<RoomFormValues>
                initialValues={{
                  name: room.name || "",
                  capacity: room.capacity?.toString() || "",
                  price: room.price?.toString() || "",
                  description: room.description || "",
                  property: room.property?.slug || room.propertyId?.toString() || "",
                  limit: room.stock?.toString() || "",
                  images: [],
                  facilities: room.facilities?.map(f => ({ title: f.title })) || [{ title: "" }],
                }}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={async (values) => {
                  setSubmitting(true)
                  try {
                    console.log("Form submitted with values:", values)
                    
                    // Only include changed fields
                    const payload: any = {}
                    
                    if (values.name !== room.name) payload.name = values.name
                    if (values.capacity !== room.capacity?.toString()) payload.capacity = values.capacity
                    if (values.price !== room.price?.toString()) payload.price = values.price
                    if (values.description !== room.description) payload.description = values.description
                    if (values.property !== (room.property?.slug || room.propertyId?.toString())) payload.property = values.property
                    if (values.limit !== room.stock?.toString()) payload.limit = values.limit
                    
                    // Always include these if provided
                    if (values.images.length > 0) payload.images = values.images
                    if (values.facilities.length > 0 && values.facilities.some(f => f.title.trim())) {
                      payload.facilities = values.facilities.filter(f => f.title.trim())
                    }

                    await updateRoom({ roomId: Number(roomId), payload })
                  } catch (err) {
                    console.error("Error updating room:", err)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {({ setFieldValue, values }) => (
                  <Form className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* LEFT COLUMN */}
                      <div className="space-y-6">
                        <Card className="p-6 bg-card border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Informasi Dasar</h3>
                          <div className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                                Nama Kamar *
                              </Label>
                              <Field
                                name="name"
                                as={Input}
                                placeholder="Masukkan nama kamar"
                                className="bg-background border-input focus:ring-primary focus:border-primary"
                              />
                              <ErrorMessage name="name" component="div" className="text-sm text-destructive" />
                            </div>

                            {/* Capacity and Stock - Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="capacity" className="text-sm font-semibold text-foreground">
                                  Kapasitas Tamu *
                                </Label>
                                <Field
                                  name="capacity"
                                  as={Input}
                                  placeholder="2"
                                  className="bg-background border-input focus:ring-primary focus:border-primary"
                                />
                                <ErrorMessage name="capacity" component="div" className="text-sm text-destructive" />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="limit" className="text-sm font-semibold text-foreground">
                                  Stock Kamar *
                                </Label>
                                <Field
                                  name="limit"
                                  as={Input}
                                  placeholder="3"
                                  className="bg-background border-input focus:ring-primary focus:border-primary"
                                />
                                <ErrorMessage name="limit" component="div" className="text-sm text-destructive" />
                              </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                              <Label htmlFor="price" className="text-sm font-semibold text-foreground">
                                Harga per Malam (IDR) *
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                  Rp
                                </span>
                                <Field
                                  name="price"
                                  as={Input}
                                  placeholder="500000"
                                  className="bg-background border-input focus:ring-primary focus:border-primary pl-10"
                                />
                              </div>
                              <ErrorMessage name="price" component="div" className="text-sm text-destructive" />
                            </div>
                          </div>
                        </Card>

                        {/* Facilities */}
                        <Card className="p-6 bg-card border-border">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-foreground font-semibold text-base">
                                Fasilitas Kamar *
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setFieldValue("facilities", [
                                    ...values.facilities,
                                    { title: "" },
                                  ]);
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Fasilitas
                              </Button>
                            </div>

                            {values.facilities.map((facility, index) => (
                              <div key={index} className="flex gap-3 items-start">
                                <div className="flex-1">
                                  <Field
                                    name={`facilities.${index}.title`}
                                    as={Input}
                                    placeholder="Contoh: AC, WiFi, TV"
                                    className="h-12 bg-background border-input focus:ring-primary focus:border-primary rounded-lg transition-all"
                                  />
                                  <ErrorMessage
                                    name={`facilities.${index}.title`}
                                    component="div"
                                    className="text-sm text-destructive mt-1"
                                  />
                                </div>
                                {values.facilities.length > 1 && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      const updated = values.facilities.filter(
                                        (_, i) => i !== index
                                      );
                                      setFieldValue("facilities", updated);
                                    }}
                                    className="mt-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="space-y-6">
                        <Card className="p-6 bg-card border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Detail Properti</h3>
                          <div className="space-y-6">
                            {/* Property */}
                            <div className="space-y-2">
                              <Label htmlFor="property" className="text-sm font-semibold text-foreground">
                                Properti *
                              </Label>
                              <Field name="property">
                                {({ field, form }: any) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={(value) => form.setFieldValue("property", value)}
                                  >
                                    <SelectTrigger className="bg-background border-input focus:ring-primary focus:border-primary">
                                      <SelectValue placeholder={loadingProperties ? "Memuat..." : "Pilih properti"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {properties.map((p) => (
                                        <SelectItem key={p.id} value={p.slug}>
                                          {p.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </Field>
                              <ErrorMessage name="property" component="div" className="text-sm text-destructive" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                                Deskripsi Kamar *
                              </Label>
                              <Field name="description">
                                {({ field }: any) => (
                                  <Textarea
                                    {...field}
                                    rows={8}
                                    placeholder="Masukkan deskripsi kamar..."
                                    className="bg-background border-input focus:ring-primary focus:border-primary resize-none"
                                  />
                                )}
                              </Field>
                              <ErrorMessage name="description" component="div" className="text-sm text-destructive" />
                            </div>
                          </div>
                        </Card>

                        {/* Images */}
                        <Card className="p-6 bg-card border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Gambar Kamar</h3>
                          <div className="space-y-4">
                            {/* Existing Images Display */}
                            {room.images && room.images.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-3">
                                  Gambar yang sudah ada ({room.images.length} gambar):
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                  {room.images.map((image, idx) => (
                                    <div key={image.id} className="relative group">
                                      <Image
                                        src={image.url}
                                        alt={`Room image ${idx + 1}`}
                                        width={150}
                                        height={100}
                                        className="w-full h-24 object-cover rounded-lg border border-border opacity-75"
                                      />
                                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-medium">Existing</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* New Images Upload */}
                            <div className="space-y-2">
                              <Input
                                type="file"
                                multiple
                                accept="image/*"
                                className="bg-background border-input file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-primary/90"
                                onChange={(e) => {
                                  if (e.currentTarget.files) {
                                    const newFiles = Array.from(e.currentTarget.files)
                                    setFieldValue("images", [...values.images, ...newFiles])
                                  }
                                  e.currentTarget.value = ""
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload gambar baru untuk ditambahkan ke room
                              </p>
                            </div>

                            {/* New Images Preview */}
                            {values.images.length > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Gambar baru yang akan ditambahkan ({values.images.length} gambar):
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                  {values.images.map((file, idx) => (
                                    <div key={idx} className="relative group">
                                      <Image
                                        src={URL.createObjectURL(file)}
                                        alt="New room image preview"
                                        width={150}
                                        height={100}
                                        className="w-full h-24 object-cover rounded-lg border border-border"
                                      />
                                      <Button
                                        type="button"
                                        size="icon"
                                        onClick={() => {
                                          const updated = values.images.filter((_, i) => i !== idx)
                                          setFieldValue("images", updated)
                                        }}
                                        className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">
                          Pastikan semua perubahan sudah benar sebelum menyimpan
                        </p>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-8 py-3 border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent font-semibold"
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            disabled={isPending || submitting || loadingProperties}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isPending || submitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                Menyimpan Perubahan...
                              </>
                            ) : (
                              "Simpan Perubahan"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default UpdateRoom
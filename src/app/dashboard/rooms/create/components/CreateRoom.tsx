"use client"
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
import { Plus, X } from "lucide-react"
import useCreateRoom from "../_hooks/useCreateRoom"
import { axiosInstance } from "@/lib/axios"
import { useSession } from "next-auth/react"

interface RoomFormValues {
  name: string
  capacity: string // String untuk sesuai dengan backend DTO
  price: string // String untuk sesuai dengan backend DTO
  description: string
  property: string
  limit: string // String untuk sesuai dengan backend DTO
  images: File[]
  facilities: { title: string }[] // Tambah facilities
}

interface PropertyOption {
  id: string | number
  title: string
  slug: string
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
  images: Yup.array().min(1, "At least one image is required"),
  facilities: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required("Facility name is required"),
      })
    )
    .min(1, "At least one facility is required"),
})

const CreateRoom = () => {
  const createRoom = useCreateRoom()
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const createRoom = useCreateRoom()
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Fix: endpoint sesuai dengan backend API
        const res = await axiosInstance.get("/property/tenant/properties", {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        })
        const propertiesData = res.data.data ?? res.data
        setProperties(Array.isArray(propertiesData) ? propertiesData : [])
        })
        const propertiesData = res.data.data ?? res.data
        setProperties(Array.isArray(propertiesData) ? propertiesData : [])
      } catch (error) {
        console.error("Failed to fetch properties", error)
        setProperties([])
        console.error("Failed to fetch properties", error)
        setProperties([])
      } finally {
        setLoadingProperties(false)
        setLoadingProperties(false)
      }
    }
    }

    if (session?.user.accessToken) {
      fetchProperties()
      fetchProperties()
    }
  }, [session])
  }, [session])

  return (
    <div className="min-h-screen bg-background">
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Buat <span className="text-primary">Kamar</span>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Buat <span className="text-primary">Kamar</span>
            </h1>
            <p className="text-muted-foreground text-lg">Isi detail untuk membuat kamar baru Anda</p>
            <p className="text-muted-foreground text-lg">Isi detail untuk membuat kamar baru Anda</p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Detail Kamar</CardTitle>
            </CardHeader>
            <CardContent>
              <Formik<RoomFormValues>
                initialValues={{
                  name: "",
                  capacity: "", // String
                  price: "", // String
                  description: "",
                  property: "",
                  limit: "", // String
                  images: [],
                  facilities: [{ title: "" }], // Start dengan satu facility kosong
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  setSubmitting(true)
                  try {
                    const formData = new FormData()
                    formData.append("name", values.name)
                    formData.append("capacity", values.capacity)
                    formData.append("price", values.price)
                    formData.append("description", values.description)
                    formData.append("property", values.property)
                    formData.append("limit", values.limit)

                    // Add images
                    values.images.forEach((file) => {
                      formData.append("images", file)
                    })

                    // Add facilities with proper format for backend
                    values.facilities.forEach((facility, index) => {
                      formData.append(`facilities[${index}][title]`, facility.title)
                    })

                    await createRoom.mutateAsync(formData)
                    resetForm()
                  } catch (err) {
                    console.error("Error creating room:", err)
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

                        {/* Facilities - Updated to match CreateProperty pattern */}
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

                        {/* Images Upload */}
                        <Card className="p-6 bg-card border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Gambar Kamar *</h3>
                          <div className="space-y-4">
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
                              <ErrorMessage name="images" component="div" className="text-sm text-destructive" />
                            </div>

                            {/* Preview */}
                            {values.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-3">
                                {values.images.map((file, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                                      alt="preview"
                                      className="w-full h-24 object-cover rounded-lg border border-border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = values.images.filter((_, i) => i !== idx)
                                        setFieldValue("images", updated)
                                      }}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={submitting || loadingProperties}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                      >
                        {submitting ? "Membuat..." : "Buat Kamar"}
                      </Button>
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
  )
}

export default CreateRoom
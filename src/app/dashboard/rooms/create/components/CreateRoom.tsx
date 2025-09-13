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
import useCreateRoom from "../_hooks/useCreateRoom"
import { axiosInstance } from "@/lib/axios"
import { useSession } from "next-auth/react"

interface RoomFormValues {
  name: string
  capacity: number
  price: number
  description: string
  property: string
  limit: number
  images: File[] // ✅ tambahkan images
}

interface PropertyOption {
  id: string | number
  title: string
  slug: string
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Room name is required"),
  capacity: Yup.number().required("Capacity is required").min(1, "Minimum is 1"),
  price: Yup.number().required("Price is required").min(0, "Minimum is 0"),
  description: Yup.string().required("Description is required"),
  property: Yup.string().required("Property is required"),
  limit: Yup.number().required("Limit is required").min(1, "Minimum is 1"),
  images: Yup.array().min(1, "At least one image is required"), // ✅ validasi
})

const CreateRoom = () => {
  const createRoom = useCreateRoom()
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axiosInstance.get("/property", {
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Buat <span className="text-primary">Kamar</span>
            </h1>
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
                  capacity: 1,
                  price: 0,
                  description: "",
                  property: "",
                  limit: 1,
                  images: [],
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  setSubmitting(true)
                  try {
                    const formData = new FormData()
                    formData.append("name", values.name)
                    formData.append("capacity", values.capacity.toString())
                    formData.append("price", values.price.toString())
                    formData.append("description", values.description)
                    formData.append("property", values.property)
                    formData.append("limit", values.limit.toString())

                    values.images.forEach((file) => {
                      formData.append("images", file)
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

                            {/* Capacity */}
                            <div className="space-y-2">
                              <Label htmlFor="capacity" className="text-sm font-semibold text-foreground">
                                Kapasitas *
                              </Label>
                              <Field
                                name="capacity"
                                type="number"
                                as={Input}
                                min="1"
                                className="bg-background border-input focus:ring-primary focus:border-primary"
                              />
                              <ErrorMessage name="capacity" component="div" className="text-sm text-destructive" />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                              <Label htmlFor="price" className="text-sm font-semibold text-foreground">
                                Harga *
                              </Label>
                              <Field
                                name="price"
                                type="number"
                                as={Input}
                                min="0"
                                className="bg-background border-input focus:ring-primary focus:border-primary"
                              />
                              <ErrorMessage name="price" component="div" className="text-sm text-destructive" />
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                              <Label htmlFor="limit" className="text-sm font-semibold text-foreground">
                                Batas Stok *
                              </Label>
                              <Field
                                name="limit"
                                type="number"
                                as={Input}
                                min="1"
                                className="bg-background border-input focus:ring-primary focus:border-primary"
                              />
                              <ErrorMessage name="limit" component="div" className="text-sm text-destructive" />
                            </div>
                          </div>
                        </Card>

                        {/* Images Upload */}
                        <Card className="p-6 bg-card border-border">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Gambar Kamar</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="images" className="text-sm font-semibold text-foreground">
                                Upload Gambar *
                              </Label>
                              <Input
                                id="images"
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
                                        <SelectItem key={p.id} value={String(p.id)}>
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
                                Deskripsi *
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

export default CreateRoom

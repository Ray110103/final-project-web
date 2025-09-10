"use client"

import { useState, type ChangeEvent } from "react"
import { Formik, Field, Form, ErrorMessage } from "formik"
import * as Yup from "yup"
import Image from "next/image"
import { Trash, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useCreateProperty from "../_hooks/useCreateProperty"
import TiptapRichtextEditor from "@/components/TipTapRichTextEditor"

interface FormValues {
  title: string
  category: string
  city: string
  address: string
  location: string
  latitude: string
  longtitude: string // Keep as string for form input, will be converted to number in backend
  description: string
  thumbnail: File | null
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  city: Yup.string().required("City is required"),
  address: Yup.string().required("Address is required"),
  location: Yup.string().required("Location is required"),
  latitude: Yup.string()
    .required("Latitude is required")
    .matches(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/, "Please enter a valid latitude"),
  longtitude: Yup.string()
    .required("Longitude is required")
    .matches(/^-?((1[0-7]|[1-9])?[0-9]\.{1}\d{1,6}$|180\.{1}0{1,6}$)/, "Please enter a valid longitude"),
  description: Yup.string().required("Description is required"),
  thumbnail: Yup.mixed().required("Thumbnail is required"),
})

const CreateProperty = () => {
  const [previewImage, setPreviewImage] = useState<string>("")
  const { mutateAsync: createProperty, isPending } = useCreateProperty()

  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewImage(URL.createObjectURL(file))
      setFieldValue("thumbnail", file)
    }
  }

  const handleRemoveThumbnail = (setFieldValue: (field: string, value: any) => void) => {
    setPreviewImage("")
    setFieldValue("thumbnail", null)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Create <span className="text-orange-500">Property</span>
            </h1>
            <p className="text-gray-400 text-lg">Fill in the details to create your new property</p>
          </div>

          <Formik<FormValues>
            initialValues={{
              title: "",
              category: "",
              city: "",
              address: "",
              location: "",
              latitude: "",
              longtitude: "",
              description: "",
              thumbnail: null,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              // Only pass thumbnail if it exists (matches the Payload interface)
              const payload = {
                title: values.title,
                category: values.category,
                city: values.city,
                address: values.address,
                location: values.location,
                latitude: values.latitude,
                longtitude: values.longtitude,
                description: values.description,
                ...(values.thumbnail && { thumbnail: values.thumbnail }), // Only include if not null
              }
              await createProperty(payload)
            }}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Property Title */}
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-white font-medium text-base">
                        Property Title *
                      </Label>
                      <Field
                        name="title"
                        as={Input}
                        placeholder="Enter property title"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage name="title" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-white font-medium text-base">
                        Category *
                      </Label>
                      <Field
                        as="select"
                        name="category"
                        className="h-12 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 appearance-none"
                      >
                        <option value="" className="bg-gray-900">Select category</option>
                        <option value="house" className="bg-gray-900">House</option>
                        <option value="apartment" className="bg-gray-900">Apartment</option>
                        <option value="villa" className="bg-gray-900">Villa</option>
                        <option value="office" className="bg-gray-900">Office</option>
                        <option value="land" className="bg-gray-900">Land</option>
                      </Field>
                      <ErrorMessage name="category" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* City */}
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-white font-medium text-base">
                        City *
                      </Label>
                      <Field
                        name="city"
                        as={Input}
                        placeholder="Enter city"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage name="city" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                      <Label htmlFor="address" className="text-white font-medium text-base">
                        Address *
                      </Label>
                      <Field
                        name="address"
                        as={Input}
                        placeholder="Enter full address"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage name="address" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-white font-medium text-base">
                        Location *
                      </Label>
                      <Field
                        name="location"
                        as={Input}
                        placeholder="Enter location/area"
                        className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                      />
                      <ErrorMessage name="location" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* Latitude & Longitude */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="latitude" className="text-white font-medium text-base">
                          Latitude *
                        </Label>
                        <Field
                          name="latitude"
                          as={Input}
                          placeholder="e.g., -6.2088"
                          className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                        />
                        <ErrorMessage name="latitude" component="div" className="text-sm text-red-400" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="longtitude" className="text-white font-medium text-base">
                          Longitude *
                        </Label>
                        <Field
                          name="longtitude"
                          as={Input}
                          placeholder="e.g., 106.8456"
                          className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg"
                        />
                        <ErrorMessage name="longtitude" component="div" className="text-sm text-red-400" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Property Thumbnail */}
                    <div className="space-y-3">
                      <Label htmlFor="thumbnail" className="text-white font-medium text-base">
                        Property Thumbnail *
                      </Label>
                      {previewImage ? (
                        <div className="relative">
                          <Image
                            src={previewImage || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            width={500}
                            height={300}
                            className="w-full h-64 rounded-lg object-cover border-2 border-gray-700"
                          />
                          <Button
                            size="icon"
                            type="button"
                            className="absolute top-3 right-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                            onClick={() => handleRemoveThumbnail(setFieldValue)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-orange-500 transition-colors">
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                              <Upload className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <Input
                                type="file"
                                name="thumbnail"
                                accept="image/*"
                                onChange={(e) => handleThumbnailChange(e, setFieldValue)}
                                className="hidden"
                                id="thumbnail-upload"
                              />
                              <label
                                htmlFor="thumbnail-upload"
                                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer font-medium transition-colors"
                              >
                                Choose Image
                              </label>
                              <p className="text-gray-400 text-sm mt-2">
                                Upload property thumbnail (JPG, PNG, GIF up to 10MB)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <ErrorMessage name="thumbnail" component="div" className="text-sm text-red-400" />
                    </div>

                    {/* Property Description */}
                    <div className="space-y-3">
                      <Label className="text-white font-medium text-base">Property Description *</Label>
                      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                        <TiptapRichtextEditor name="description" label="" />
                      </div>
                      <ErrorMessage name="description" component="div" className="text-sm text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-8 border-t border-gray-700">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-8 py-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Property...
                        </>
                      ) : (
                        "Create Property"
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  )
}

export default CreateProperty
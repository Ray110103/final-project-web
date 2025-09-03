"use client"

import { ChangeEvent, useState } from "react"
import { useUpdateProfile } from "./_hooks/useUpdateProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { useGetProfile } from "../_hooks/useGetProfile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Trash, Upload, User, Camera, ArrowLeft, Save, Loader2, ImageIcon, X } from 'lucide-react'
import * as Yup from "yup"

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
})

const EditProfilePage = () => {
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)

  const onChangeThumbnail = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const files = e.target.files
    if (files && files.length) {
      setSelectedImage(URL.createObjectURL(files[0]))
      setFieldValue("pictureProfile", files[0])
    }
  }

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length) {
      setSelectedImage(URL.createObjectURL(files[0]))
      setFieldValue("pictureProfile", files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeThumbnail = (
    setFieldValue: (field: string, value: any) => void,
  ) => {
    setSelectedImage("")
    setFieldValue("pictureProfile", null)
  }

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const { data: user, isLoading } = useGetProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-6 w-32 bg-gray-800 mb-4" />
            <Skeleton className="h-8 w-64 bg-gray-800 mb-2" />
            <Skeleton className="h-4 w-96 bg-gray-800" />
          </div>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="w-32 h-32 rounded-full bg-gray-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 bg-gray-800" />
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full bg-gray-800" />
                <Skeleton className="h-12 w-32 bg-gray-800 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-0 mb-6"
            asChild
          >
            <Link href="/profile" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </Button>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Edit <span className="text-orange-500">Profile</span>
            </h1>
            <p className="text-gray-400">
              Update your profile information and profile picture
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-900 border-gray-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-orange-500" />
              Profile Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <Formik
              initialValues={{
                name: user?.name || "",
                pictureProfile: null,
              }}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={async (values) => {
                await updateProfile(values)
              }}
            >
              {({ setFieldValue, values, errors, touched }) => (
                <Form className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-white flex items-center gap-2">
                      <Camera className="h-5 w-5 text-orange-500" />
                      Profile Picture
                    </Label>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      {/* Current/Selected Image */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {selectedImage || user?.pictureProfile ? (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500/20">
                              <Image
                                src={selectedImage || user?.pictureProfile || "/placeholder.svg"}
                                alt="Profile Picture"
                                fill
                                className="object-cover"
                              />
                              {selectedImage && (
                                <Button
                                  type="button"
                                  size="icon"
                                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                                  onClick={() => removeThumbnail(setFieldValue)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-4 border-orange-500/20">
                              <User className="h-16 w-16 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 text-center">
                          {selectedImage ? "New profile picture" : "Current profile picture"}
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div className="flex-1 w-full">
                        {!selectedImage ? (
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                              dragActive 
                                ? "border-orange-500 bg-orange-500/10" 
                                : "border-gray-600 hover:border-orange-500/50"
                            }`}
                            onDrop={(e) => handleDrop(e, setFieldValue)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                          >
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                                <ImageIcon className="h-8 w-8 text-orange-500" />
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-medium text-white mb-2">
                                  Upload Profile Picture
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                  Drag and drop your image here, or click to browse
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => onChangeThumbnail(e, setFieldValue)}
                                  className="hidden"
                                  id="profile-upload"
                                />
                                <Label
                                  htmlFor="profile-upload"
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer font-medium transition-colors"
                                >
                                  <Upload className="h-4 w-4" />
                                  Choose File
                                </Label>
                              </div>

                              <p className="text-xs text-gray-500">
                                Supported formats: JPG, PNG, GIF (Max 5MB)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <Camera className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">New image selected</p>
                                  <p className="text-sm text-gray-400">Ready to upload</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                onClick={() => removeThumbnail(setFieldValue)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="name" 
                      className="text-lg font-medium text-white flex items-center gap-2"
                    >
                      <User className="h-5 w-5 text-orange-500" />
                      Full Name
                    </Label>
                    <Field
                      name="name"
                      as={Input}
                      type="text"
                      placeholder="Enter your full name"
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 h-12 text-base"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-sm text-red-400 flex items-center gap-1"
                    />
                    {values.name && !errors.name && (
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <span>✓</span> Name looks good
                      </p>
                    )}
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white h-12"
                      asChild
                    >
                      <Link href="/profile">
                        Cancel
                      </Link>
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-medium"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
                          Updating Profile...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your profile information will be visible to other users.
            <br />
            Make sure to use a clear, professional profile picture.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EditProfilePage

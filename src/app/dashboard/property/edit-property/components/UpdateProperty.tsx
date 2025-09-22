"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { Trash, Upload, Building, Plus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import useUpdateProperty from "../_hooks/useUpdateProperty";
import useGetCategories from "../../property-category/_hooks/useGetPropertyCategories";
import TiptapRichtextEditor from "@/components/TipTapRichTextEditor";
import { useRouter } from "next/navigation";
import useGetProperty from "../_hooks/useGetPropertyForEdit";

// Dynamically import the MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("../../../../../components/MapComponent"), { ssr: false });

interface FormValues {
  title: string;
  category: string;
  location: string;
  city: string;
  address: string;
  description: string;
  latitude: string;
  longtitude: string;
  thumbnail: File | null;
  propertyImages: File[];
  facilities: { title: string }[];
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Judul properti wajib diisi"),
  category: Yup.string().required("Kategori wajib dipilih"),
  location: Yup.string().required("Provinsi wajib dipilih"),
  city: Yup.string().required("Kota wajib diisi"),
  address: Yup.string().required("Alamat wajib diisi"),
  description: Yup.string().required("Deskripsi wajib diisi"),
  latitude: Yup.string().required("Latitude wajib diisi"),
  longtitude: Yup.string().required("Longitude wajib diisi"),
  facilities: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required("Nama fasilitas wajib diisi"),
      })
    )
    .min(1, "Minimal satu fasilitas"),
});

interface UpdatePropertyProps {
  slug: string;
}

const UpdateProperty = ({ slug }: UpdatePropertyProps) => {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [hasNewThumbnail, setHasNewThumbnail] = useState(false);
  
  // Hooks
  const { mutateAsync: updateProperty, isPending } = useUpdateProperty();
  const { data: property, isLoading: loadingProperty, error: propertyError } = useGetProperty(slug);
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useGetCategories();

  // Set initial thumbnail preview from existing property
  useEffect(() => {
    if (property?.thumbnail && !hasNewThumbnail) {
      setPreviewImage(property.thumbnail);
    }
  }, [property?.thumbnail, hasNewThumbnail]);

  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFieldValue("thumbnail", file);
      setHasNewThumbnail(true);
    }
  };

  const handleRemoveThumbnail = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setPreviewImage("");
    setFieldValue("thumbnail", null);
    setHasNewThumbnail(true);
  };

  // Function to handle latitude and longitude updates from the map
  const handleLocationChange = (
    lat: number,
    lng: number,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("latitude", lat.toString());
    setFieldValue("longtitude", lng.toString());
  };

  // Loading state
  if (loadingProperty) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <Card className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 bg-destructive/10 rounded-xl">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Property Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                The property you're trying to edit could not be found or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
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
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Edit <span className="text-primary">Properti</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Update detail properti Anda
            </p>
          </div>

          <Formik<FormValues>
            initialValues={{
              title: property.title || "",
              category: property.category?.slug || "",
              location: property.location || "",
              city: property.city || "",
              address: property.address || "",
              description: property.description || "",
              latitude: property.latitude?.toString() || "",
              longtitude: property.longtitude?.toString() || "",
              thumbnail: null,
              propertyImages: [],
              facilities: property.facilities?.map(f => ({ title: f.title })) || [{ title: "" }],
            }}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={async (values) => {
              console.log("Form submitted with values:", values);
              
              // Only include changed fields
              const payload: any = {};
              
              if (values.title !== property.title) payload.title = values.title;
              if (values.category !== property.category?.slug) payload.category = values.category;
              if (values.location !== property.location) payload.location = values.location;
              if (values.city !== property.city) payload.city = values.city;
              if (values.address !== property.address) payload.address = values.address;
              if (values.description !== property.description) payload.description = values.description;
              if (values.latitude !== property.latitude?.toString()) payload.latitude = values.latitude;
              if (values.longtitude !== property.longtitude?.toString()) payload.longtitude = values.longtitude;
              
              // Always include these if provided
              if (values.thumbnail) payload.thumbnail = values.thumbnail;
              if (values.propertyImages.length > 0) payload.propertyImages = values.propertyImages;
              if (values.facilities.length > 0 && values.facilities.some(f => f.title.trim())) {
                payload.facilities = values.facilities.filter(f => f.title.trim());
              }

              await updateProperty({ slug, payload });
            }}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column */}
                    <div className="space-y-8">
                      {/* Property Title */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="title"
                          className="text-foreground font-semibold text-base"
                        >
                          Judul Properti *
                        </Label>
                        <Field
                          name="title"
                          as={Input}
                          placeholder="Masukkan judul properti yang menarik"
                          className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
                        />
                        <ErrorMessage
                          name="title"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="category"
                          className="text-foreground font-semibold text-base"
                        >
                          Kategori *
                        </Label>
                        
                        {categoriesLoading ? (
                          <div className="h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-muted-foreground flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Memuat kategori...
                          </div>
                        ) : categoriesError ? (
                          <div className="h-12 w-full rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-destructive flex items-center">
                            Gagal memuat kategori. Silakan refresh halaman.
                          </div>
                        ) : (
                          <Field
                            as="select"
                            name="category"
                            className="h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                          >
                            <option value="" className="bg-background">
                              Pilih kategori
                            </option>
                            {categories?.map((category) => (
                              <option 
                                key={category.id} 
                                value={category.slug}
                                className="bg-background"
                                disabled={!category.isActive}
                              >
                                {category.name} {!category.isActive && "(Tidak Aktif)"}
                              </option>
                            ))}
                          </Field>
                        )}
                        
                        <ErrorMessage
                          name="category"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="location"
                          className="text-foreground font-semibold text-base"
                        >
                          Provinsi *
                        </Label>
                        <Field
                          as="select"
                          name="location"
                          className="h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                        >
                          <option value="" className="bg-background">
                            Pilih provinsi
                          </option>
                          <option value="jakarta" className="bg-background">
                            DKI Jakarta
                          </option>
                          <option value="jawa-barat" className="bg-background">
                            Jawa Barat
                          </option>
                          <option value="bali" className="bg-background">
                            Bali
                          </option>
                          <option value="jawa-timur" className="bg-background">
                            Jawa Timur
                          </option>
                          <option value="yogyakarta" className="bg-background">
                            DI Yogyakarta
                          </option>
                          <option
                            value="sumatera-utara"
                            className="bg-background"
                          >
                            Sumatera Utara
                          </option>
                        </Field>
                        <ErrorMessage
                          name="location"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="city"
                          className="text-foreground font-semibold text-base"
                        >
                          Kota *
                        </Label>
                        <Field
                          name="city"
                          as={Input}
                          placeholder="Masukkan nama kota"
                          className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
                        />
                        <ErrorMessage
                          name="city"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="address"
                          className="text-foreground font-semibold text-base"
                        >
                          Alamat Lengkap *
                        </Label>
                        <Field
                          name="address"
                          as={Textarea}
                          placeholder="Masukkan alamat lengkap properti"
                          className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg resize-none transition-all"
                        />
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* Map */}
                      <div className="space-y-3">
                        <Label className="text-foreground font-semibold text-base">
                          Lokasi pada Peta *
                        </Label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <MapComponent
                            onLocationChange={(lat: number, lng: number) => {
                              setFieldValue("latitude", lat.toString());
                              setFieldValue("longtitude", lng.toString());
                            }}
                            style={{ height: "400px", width: "100%" }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm text-muted-foreground">Latitude</Label>
                            <Input
                              value={values.latitude}
                              readOnly
                              className="h-10 bg-muted text-muted-foreground"
                              placeholder="Auto-filled from map"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Longitude</Label>
                            <Input
                              value={values.longtitude}
                              readOnly
                              className="h-10 bg-muted text-muted-foreground"
                              placeholder="Auto-filled from map"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Facilities */}
                      <Card className="p-6 bg-background border-border">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-foreground font-semibold text-base">
                              Fasilitas Properti *
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
                                  placeholder="Contoh: Kolam Renang, Parkir, WiFi"
                                  className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
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

                    {/* Right Column */}
                    <div className="space-y-8">
                      {/* Property Thumbnail */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="thumbnail"
                          className="text-foreground font-semibold text-base"
                        >
                          Foto Utama Properti
                        </Label>
                        {previewImage ? (
                          <div className="relative group">
                            <Image
                              src={previewImage}
                              alt="Thumbnail preview"
                              width={500}
                              height={300}
                              className="w-full h-64 rounded-lg object-cover border-2 border-border transition-all group-hover:border-primary/50"
                            />
                            <Button
                              size="icon"
                              type="button"
                              className="absolute top-3 right-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleRemoveThumbnail(setFieldValue)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-all">
                            <div className="space-y-4">
                              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                <Input
                                  type="file"
                                  name="thumbnail"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleThumbnailChange(e, setFieldValue)
                                  }
                                  className="hidden"
                                  id="thumbnail-upload"
                                />
                                <label
                                  htmlFor="thumbnail-upload"
                                  className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer font-semibold transition-colors shadow-sm"
                                >
                                  Pilih Gambar
                                </label>
                                <p className="text-muted-foreground text-sm mt-2">
                                  Upload foto utama properti (JPG, PNG, GIF maksimal 10MB)
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <ErrorMessage
                          name="thumbnail"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>

                      {/* Property Images */}
                      <Card className="p-6 bg-background border-border">
                        <div className="space-y-4">
                          <Label className="text-foreground font-semibold text-base">
                            Foto Properti Tambahan
                          </Label>
                          
                          {/* Existing Images Display */}
                          {property.images && property.images.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-3">
                                Foto yang sudah ada ({property.images.length} foto):
                              </p>
                              <div className="grid grid-cols-3 gap-3">
                                {property.images.map((image, idx) => (
                                  <div key={image.id} className="relative group">
                                    <Image
                                      src={image.url}
                                      alt={`Property image ${idx + 1}`}
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
                          <div className="space-y-4">
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              className="bg-background border-border text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-primary/90"
                              onChange={(e) => {
                                if (e.currentTarget.files) {
                                  const newFiles = Array.from(
                                    e.currentTarget.files
                                  );
                                  setFieldValue("propertyImages", [
                                    ...values.propertyImages,
                                    ...newFiles,
                                  ]);
                                }
                                e.currentTarget.value = "";
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              Upload foto baru untuk ditambahkan ke properti
                            </p>
                          </div>

                          {/* New Images Preview */}
                          {values.propertyImages.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Foto baru yang akan ditambahkan ({values.propertyImages.length} foto):
                              </p>
                              <div className="grid grid-cols-3 gap-3">
                                {values.propertyImages.map((file, idx) => (
                                  <div key={idx} className="relative group">
                                    <Image
                                      src={URL.createObjectURL(file)}
                                      alt="New property preview"
                                      width={150}
                                      height={100}
                                      className="w-full h-24 object-cover rounded-lg border border-border"
                                    />
                                    <Button
                                      type="button"
                                      size="icon"
                                      onClick={() => {
                                        const updated =
                                          values.propertyImages.filter(
                                            (_, i) => i !== idx
                                          );
                                        setFieldValue("propertyImages", updated);
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

                      {/* Property Description */}
                      <div className="space-y-3">
                        <Label className="text-foreground font-semibold text-base">
                          Deskripsi Properti *
                        </Label>
                        <div className="bg-background border border-border rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                          <TiptapRichtextEditor 
                            name="description" 
                            label=""
                          />
                        </div>
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>
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
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isPending ? (
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
        </div>
      </main>
    </div>
  );
};

export default UpdateProperty;
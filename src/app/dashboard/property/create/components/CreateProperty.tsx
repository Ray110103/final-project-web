"use client";

import { useState, type ChangeEvent } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { Trash, Upload, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { title } from "process";
// import useCreateProperty from "./_hooks/useCreateProperty"

interface FormValues {
  title: string;
  category: string;
  location: string;
  city: string;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  thumbnail: File | null;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
  location: Yup.string().required("Location is required"),
  city: Yup.string().required("City is required"),
  address: Yup.string().required("Address is required"),
  description: Yup.string().required("Description is required"),
  latitude: Yup.string().required("Latitude is required"),
  longitude: Yup.string().required("Longitude is required"),
  thumbnail: Yup.mixed().required("Thumbnail is required"),
});

const CreateProperty = () => {
  const [previewImage, setPreviewImage] = useState<string>("");
  // const { mutateAsync: createProperty, isPending } = useCreateProperty()
  const isPending = false; // Mock for now

  const handleThumbnailChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFieldValue("thumbnail", file);
    }
  };

  const handleRemoveThumbnail = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setPreviewImage("");
    setFieldValue("thumbnail", null);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                Buat <span className="text-primary">Properti</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Isi detail untuk membuat properti baru Anda
            </p>
          </div>

          <Formik<FormValues>
            initialValues={{
              title: "",
              category: "",
              location: "",
              city: "",
              address: "",
              description: "",
              latitude: "",
              longitude: "",
              thumbnail: null,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              console.log("[v0] Form submitted with values:", values);
              await CreateProperty();
            }}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Property Title */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-foreground font-medium text-base"
                      >
                        Judul Properti *
                      </Label>
                      <Field
                        name="title"
                        as={Input}
                        placeholder="Masukkan judul properti Anda"
                        className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
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
                        className="text-foreground font-medium text-base"
                      >
                        Kategori *
                      </Label>
                      <Field
                        as="select"
                        name="category"
                        className="h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                      >
                        <option value="" className="bg-background">
                          Pilih kategori
                        </option>
                        <option value="rumah" className="bg-background">
                          Rumah
                        </option>
                        <option value="apartemen" className="bg-background">
                          Apartemen
                        </option>
                        <option value="villa" className="bg-background">
                          Villa
                        </option>
                        <option value="kost" className="bg-background">
                          Kost
                        </option>
                        <option value="kontrakan" className="bg-background">
                          Kontrakan
                        </option>
                        <option value="ruko" className="bg-background">
                          Ruko
                        </option>
                        <option value="kantor" className="bg-background">
                          Kantor
                        </option>
                      </Field>
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
                        className="text-foreground font-medium text-base"
                      >
                        Provinsi *
                      </Label>
                      <Field
                        as="select"
                        name="location"
                        className="h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
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
                        className="text-foreground font-medium text-base"
                      >
                        Kota *
                      </Label>
                      <Field
                        name="city"
                        as={Input}
                        placeholder="Masukkan nama kota"
                        className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
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
                        className="text-foreground font-medium text-base"
                      >
                        Alamat Lengkap *
                      </Label>
                      <Field
                        name="address"
                        as={Textarea}
                        placeholder="Masukkan alamat lengkap properti"
                        className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg resize-none"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="latitude"
                          className="text-foreground font-medium text-base"
                        >
                          Latitude *
                        </Label>
                        <Field
                          name="latitude"
                          as={Input}
                          placeholder="-6.2088"
                          className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
                        />
                        <ErrorMessage
                          name="latitude"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="longitude"
                          className="text-foreground font-medium text-base"
                        >
                          Longitude *
                        </Label>
                        <Field
                          name="longitude"
                          as={Input}
                          placeholder="106.8456"
                          className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
                        />
                        <ErrorMessage
                          name="longitude"
                          component="div"
                          className="text-sm text-destructive"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Property Thumbnail */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="thumbnail"
                        className="text-foreground font-medium text-base"
                      >
                        Foto Properti *
                      </Label>
                      {previewImage ? (
                        <div className="relative">
                          <Image
                            src={previewImage || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            width={500}
                            height={300}
                            className="w-full h-64 rounded-lg object-cover border-2 border-border"
                          />
                          <Button
                            size="icon"
                            type="button"
                            className="absolute top-3 right-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg"
                            onClick={() => handleRemoveThumbnail(setFieldValue)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
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
                                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer font-medium transition-colors"
                              >
                                Pilih Gambar
                              </label>
                              <p className="text-muted-foreground text-sm mt-2">
                                Upload foto properti (JPG, PNG, GIF maksimal
                                10MB)
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

                    {/* Property Description */}
                    <div className="space-y-3">
                      <Label className="text-foreground font-medium text-base">
                        Deskripsi Properti *
                      </Label>
                      <Field
                        name="description"
                        as={Textarea}
                        placeholder="Deskripsikan properti Anda secara detail..."
                        className="min-h-[200px] bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg resize-none"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-8 border-t border-border">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-8 py-3 border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent"
                    >
                      Simpan Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Membuat Properti...
                        </>
                      ) : (
                        "Buat Properti"
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
  );
};

export default CreateProperty;

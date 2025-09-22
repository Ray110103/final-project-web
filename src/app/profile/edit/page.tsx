"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useGetProfile } from "../_hooks/useGetProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash,
  Upload,
  User,
  Camera,
  ArrowLeft,
  Save,
  Loader2,
  ImageIcon,
  X,
  AlertCircle,
  CheckCircle,
  FileImage,
} from "lucide-react";
import * as Yup from "yup";
import { useUpdateProfile } from "./_hooks/useUpdateProfile";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Nama lengkap wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .matches(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),
});

const EditProfilePage = () => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // File validation function
  const validateFile = (file: File): boolean => {
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return false;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP."
      );
      return false;
    }

    return true;
  };

  const onChangeThumbnail = (
    e: ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = e.target.files;
    if (files && files.length) {
      const file = files[0];

      if (!validateFile(file)) return;

      setImageLoading(true);
      setSelectedImage(URL.createObjectURL(file));
      setFieldValue("pictureProfile", file);
      toast.success("Gambar berhasil dipilih!");
      setImageLoading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length) {
      const file = files[0];

      if (!validateFile(file)) return;

      setImageLoading(true);
      setSelectedImage(URL.createObjectURL(file));
      setFieldValue("pictureProfile", file);
      toast.success("Gambar berhasil dipilih!");
      setImageLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeThumbnail = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSelectedImage("");
    setFieldValue("pictureProfile", null);
    toast.info("Gambar profil dihapus");
  };

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { data: user, isLoading, error } = useGetProfile();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-32 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Gagal Memuat Profil</h2>
            <p className="text-muted-foreground mb-4">
              Tidak dapat memuat data profil. Silakan coba lagi.
            </p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground p-0 mb-6"
            asChild
          >
            <Link href="/profile" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Profil
            </Link>
          </Button>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Edit <span className="text-primary">Profil</span>
            </h1>
            <p className="text-muted-foreground">
              Perbarui informasi profil dan foto profil Anda
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pastikan informasi yang Anda masukkan akurat. Foto profil akan
            terlihat oleh pengguna lain.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informasi Profil
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
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await updateProfile(values);
                } catch (error) {
                  console.error("Submit error:", error);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ setFieldValue, values, errors, touched, isSubmitting }) => (
                <Form className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Foto Profil
                    </Label>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      {/* Current/Selected Image */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {selectedImage || user?.pictureProfile ? (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                              {imageLoading ? (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                </div>
                              ) : (
                                <Image
                                  src={
                                    selectedImage ||
                                    user?.pictureProfile ||
                                    "/placeholder.svg"
                                  }
                                  alt="Foto Profil"
                                  fill
                                  className="object-cover"
                                  onError={() => {
                                    toast.error("Gagal memuat gambar");
                                    setSelectedImage("");
                                  }}
                                />
                              )}
                              {selectedImage && !imageLoading && (
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
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-4 border-primary/20 shadow-lg">
                              <User className="h-16 w-16 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {selectedImage
                            ? "Foto profil baru"
                            : "Foto profil saat ini"}
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div className="flex-1 w-full">
                        {!selectedImage ? (
                          <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                              dragActive
                                ? "border-primary bg-primary/5 scale-105"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                            onDrop={(e) => handleDrop(e, setFieldValue)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                          >
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <ImageIcon className="h-8 w-8 text-primary" />
                              </div>

                              <div>
                                <h3 className="text-lg font-medium mb-2">
                                  Upload Foto Profil
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Seret dan lepas gambar di sini, atau klik
                                  untuk memilih file
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    onChangeThumbnail(e, setFieldValue)
                                  }
                                  className="hidden"
                                  id="profile-upload"
                                  disabled={isPending || isSubmitting}
                                />
                                <Label
                                  htmlFor="profile-upload"
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer font-medium transition-colors disabled:opacity-50"
                                >
                                  <Upload className="h-4 w-4" />
                                  Pilih File
                                </Label>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Format yang didukung: JPG, PNG, GIF, WebP (Maks
                                5MB)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/50 rounded-xl p-6 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    Gambar baru dipilih
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Siap untuk diupload
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeThumbnail(setFieldValue)}
                                disabled={isPending || isSubmitting}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Hapus
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Name Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="name"
                      className="text-lg font-medium flex items-center gap-2"
                    >
                      <User className="h-5 w-5 text-primary" />
                      Nama Lengkap
                    </Label>
                    <Field
                      name="name"
                      as={Input}
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      className={`h-12 text-base transition-colors ${
                        errors.name && touched.name
                          ? "border-red-500 focus:border-red-500"
                          : "focus:border-primary"
                      }`}
                      disabled={isPending || isSubmitting}
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-sm text-red-500 flex items-center gap-1"
                    />
                    {values.name && !errors.name && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Nama terlihat bagus
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12"
                      disabled={isPending || isSubmitting}
                      asChild
                    >
                      <Link href="/profile">Batal</Link>
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        isPending ||
                        isSubmitting ||
                        Boolean(errors.name && touched.name)
                      }
                      className="flex-1 h-12 text-base font-medium"
                    >
                      {isPending || isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
                          Memperbarui Profil...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Simpan Perubahan
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
          <p className="text-sm text-muted-foreground">
            Informasi profil Anda akan terlihat oleh pengguna lain.
            <br />
            Pastikan menggunakan foto profil yang jelas dan profesional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;

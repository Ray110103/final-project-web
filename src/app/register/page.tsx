"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { Loader, Github, Building, ArrowLeft } from "lucide-react"
import * as Yup from "yup"
import useRegister from "./_hooks/useRegister"
import Link from "next/link"

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Nama wajib diisi").min(3),
  email: Yup.string().required("Email wajib diisi").email(),
  password: Yup.string().required("Password wajib diisi").min(6),
})

const SignUp = () => {
  const { mutateAsync: register, isPending } = useRegister()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await register(values)
            }}
          >
            <Form>
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Building className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-primary">PropertyRent</span>
                </div>

                <CardTitle className="text-foreground text-2xl font-bold text-center">Buat akun Anda</CardTitle>
                <CardDescription className="text-muted-foreground text-center">
                  Masukkan informasi Anda untuk memulai
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* NAME */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground text-sm font-medium">
                    Nama Lengkap
                  </Label>
                  <Field
                    name="name"
                    as={Input}
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                  <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm font-medium">
                    Email
                  </Label>
                  <Field
                    name="email"
                    as={Input}
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                  <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-sm font-medium">
                    Password
                  </Label>
                  <Field
                    name="password"
                    as={Input}
                    type="password"
                    placeholder="Buat password"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                  <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
                  <p className="text-xs text-muted-foreground">Password minimal 6 karakter</p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 pt-6">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-colors"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Membuat akun...
                    </div>
                  ) : (
                    "Buat akun"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Atau lanjutkan dengan</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    type="button"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    type="button"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Discord
                  </Button>
                </div>

                {/* Sign In Link */}
                <div className="text-center text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Masuk
                  </Link>
                </div>

                {/* Tenant Register Button */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">Ingin menyewakan properti Anda?</p>
                  <Link href="/register/tenant-register">
                    <Button
                      variant="outline"
                      className="w-full bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      type="button"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Daftar sebagai Penyewa
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Form>
          </Formik>
        </Card>
      </div>
    </main>
  )
}

export default SignUp

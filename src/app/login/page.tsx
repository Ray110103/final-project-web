"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { Loader, Github, Building, ArrowLeft } from "lucide-react"
import Link from "next/link"
import useLogin from "./_hooks/useLogin"

const SignIn = () => {
  const { mutateAsync: login, isPending } = useLogin()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={async (values) => {
              await login({ email: values.email, password: values.password })
            }}
          >
            <Form>
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Building className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-primary">PropertyRent</span>
                </div>

                <CardTitle className="text-foreground text-2xl font-bold text-center">Selamat Datang Kembali</CardTitle>
                <CardDescription className="text-muted-foreground text-center">
                  Masuk ke akun Anda untuk melanjutkan
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-foreground text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:text-primary/80 text-sm transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <Field
                    name="password"
                    as={Input}
                    type="password"
                    placeholder="Masukkan password Anda"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                  <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
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
                      Masuk...
                    </div>
                  ) : (
                    "Masuk"
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
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Daftar sekarang
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

export default SignIn

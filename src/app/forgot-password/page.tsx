"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { Loader, ArrowLeft, Building } from "lucide-react"
import useForgotPassword from "./_hooks/useForgotPassword"
import Link from "next/link"

const ForgotPassword = () => {
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-background to-muted/20 opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-card border-border shadow-2xl">
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async (values) => {
              await forgotPassword({ email: values.email })
            }}
          >
            <Form>
              <CardHeader className="space-y-1 pb-6">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Building className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-primary">PropertyRent</span>
                </div>

                <CardTitle className="text-foreground text-2xl font-bold text-center">Lupa Kata Sandi</CardTitle>
                <CardDescription className="text-muted-foreground text-center">
                  Masukkan email Anda untuk mereset akun
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
                    placeholder="Email Anda"
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                  <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 pt-6">
                {/* Submit Button with extra gap */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 transition-colors"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Mengirim...
                    </div>
                  ) : (
                    "Kirim"
                  )}
                </Button>

                {/* Back to Sign In Link */}
                <div className="text-center">
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke masuk
                  </Link>
                </div>

                {/* Sign In Link */}
                <div className="text-center text-sm text-muted-foreground">
                  Ingat kata sandi Anda?{" "}
                  <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Masuk
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

export default ForgotPassword

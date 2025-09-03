"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { ArrowLeft, Building, Loader2 } from "lucide-react"
import Link from "next/link"
import * as Yup from "yup"
import useRegisterTenant from "./_hooks/useRegisterTenant"

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(3),
  email: Yup.string().required("Email is required").email(),
  password: Yup.string().required("Password is required").min(6),
})

const SignUp = () => {
  const { mutateAsync: register, isPending } = useRegisterTenant()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <Card>
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              referralCode: "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await register(values)
            }}
          >
            <Form className="space-y-4">
              <CardHeader className="text-center">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                >
                  <Building className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-foreground">PropertyRent</span>
                </Link>
                <CardTitle className="text-2xl text-foreground">Daftar sebagai Penyewa</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Masukkan detail Anda untuk membuat akun penyewa properti
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-6">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-foreground">
                      Nama
                    </Label>
                    <Field
                      name="name"
                      as={Input}
                      type="text"
                      placeholder="Nama lengkap Anda"
                      className="bg-background border-input"
                    />
                    <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
                  </div>

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Field
                      name="email"
                      as={Input}
                      type="email"
                      placeholder="email@example.com"
                      className="bg-background border-input"
                    />
                    <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                  </div>

                  {/* Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <Field
                      name="password"
                      as={Input}
                      type="password"
                      placeholder="Masukkan password"
                      className="bg-background border-input"
                    />
                    <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isPending ? "Mendaftar..." : "Daftar sebagai Penyewa"}
                </Button>
              </CardFooter>
            </Form>
          </Formik>
        </Card>
      </div>
    </main>
  )
}

export default SignUp

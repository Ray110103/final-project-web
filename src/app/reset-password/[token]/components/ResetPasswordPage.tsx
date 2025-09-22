"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage, Field, Form, Formik } from "formik"
import useResetPassword from "../_hooks/useResetPassword"
import * as Yup from "yup"
import { Loader, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ResetPasswordPageProps {
  token: string
}

const validationSchema = Yup.object().shape({
  password: Yup.string().required("Password is required").min(6),
  confirmPassword: Yup.string()
    .required("Confirm Password Is Required")
    .oneOf([Yup.ref("password")], "Your Password Do Not Match"),
})

const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  const { mutateAsync: resetPassword, isPending } = useResetPassword(token)

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-card border-border shadow-2xl">
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await resetPassword({ password: values.password })
            }}
          >
            <Form>
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">PR</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    Property<span className="text-primary">Rent</span>
                  </span>
                </div>

                <CardTitle className="text-foreground text-2xl font-bold text-center">Reset Password</CardTitle>
                <CardDescription className="text-muted-foreground text-center">
                  Enter your password below to reset your account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-sm font-medium">
                    Password
                  </Label>
                  <Field
                    name="password"
                    as={Input}
                    type="password"
                    placeholder="Your password"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                  <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Field
                    name="confirmPassword"
                    as={Input}
                    type="password"
                    placeholder="Confirm your password"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="text-sm text-destructive" />
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
                      Resetting password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
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

export default ResetPasswordPage

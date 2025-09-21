"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Loader } from "lucide-react";

import Link from "next/link";
import useResetPassword from "../../_hooks/useResetPassword";

import * as Yup from "yup";

interface ResetPasswordPageProps {
  token: string;
}

const validationSchema = Yup.object().shape({
  password: Yup.string().required("Password is required").min(6),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Your Password do not match"),
});

const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  const { mutateAsync: resetPassword, isPending } = useResetPassword(token);
  return (
    <main className="container mx-auto">
      <Card className="w-full max-w-sm mx-auto mt-24">
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            await resetPassword({
              password: values.password,
            });
          }}
        >
          <Form className="space-y-4">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your password below to reset your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* PASSWORD */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>

                  <Field
                    name="password"
                    as={Input}
                    type="password"
                    placeholder="Your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>
                {/* CONFIRM PASSWORD */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>

                  <Field
                    name="confirmPassword"
                    as={Input}
                    type="password"
                    placeholder="Your confirm password"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader className="animate-spin" /> : "Submit"}
              </Button>
            </CardFooter>
          </Form>
        </Formik>
      </Card>
    </main>
  );
};

export default ResetPasswordPage;

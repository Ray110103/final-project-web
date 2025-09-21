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
import useLogin from "./_hooks/useLogin";
import Link from "next/link";

const Login = () => {
  const { mutateAsync: login, isPending } = useLogin();

  return (
    <main className="container mx-auto">
      <Card className="w-full max-w-sm mx-auto mt-24">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            await login({ email: values.email, password: values.password });
          }}
        >
          <Form className="space-y-4">
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* EMAIL */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    name="email"
                    as={Input}
                    type="email"
                    placeholder="Your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-sm text-red-500"
                  />
                </div>

                {/* PASSWORD */}
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password">Forgot Password?</Link>
                  </div>

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
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader className="animate-spin" /> : "Login"}
              </Button>
            </CardFooter>
          </Form>
        </Formik>
      </Card>
    </main>
  );
};

export default Login;

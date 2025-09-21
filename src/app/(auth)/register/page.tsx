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
import { LoaderCircle, Info } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import useRegister from "./_hooks/useRegister";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(3),
  email: Yup.string().required("Email is required").email(),
  password: Yup.string().required("Password is required").min(6),
});

const Register = () => {
  const { mutateAsync: register, isPending } = useRegister();
  const [showReferral, setShowReferral] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            await register(values);
          }}
        >
          <Form className="space-y-4">
            <CardHeader className="items-center">
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* <Button variant="outline" className="w-full gap-3">
                <GoogleLogo />
                Continue with Google
              </Button>
              
              <div className="flex items-center justify-center overflow-hidden">
                <Separator className="flex-1" />
                <span className="text-sm px-2">OR</span>
                <Separator className="flex-1" />
              </div> */}

              {/* NAME */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Field
                  name="name"
                  as={Input}
                  type="text"
                  placeholder="Your Name"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-sm text-red-500"
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Field
                  name="email"
                  as={Input}
                  type="email"
                  placeholder="Your Email"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-sm text-red-500"
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Field
                  name="password"
                  as={Input}
                  type="password"
                  placeholder="Your Password"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-sm text-red-500"
                />
              </div>
              {/* Referral Code */}
              {showReferral && (
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="referralCode">
                      Referral Code (Optional)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Get 10,000 points for you and the referrer when you
                            sign up with a referral code
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Field
                    name="referralCode"
                    as={Input}
                    type="text"
                    placeholder="Enter referral code"
                  />
                  <p className="text-muted-foreground text-xs">
                    Using a referral code gives you a discount coupon and the
                    referrer gets 10,000 points.
                  </p>
                </div>
              )}

              {!showReferral && (
                <Button
                  type="button"
                  variant="link"
                  className="text-muted-foreground h-auto p-0 text-sm"
                  onClick={() => setShowReferral(true)}
                >
                  Have a referral code?
                </Button>
              )}

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Points System
                </h4>
                <ul className="text-muted-foreground space-y-1 text-xs dark:text-gray-300">
                  <li>• Sign up bonus: 5,000 points</li>
                  <li>
                    • Referral bonus: 10,000 points (for both referrer and
                    referee)
                  </li>
                  <li>• Points expire 3 months after being credited</li>
                  <li>
                    • Discount coupons from referrals are valid for 3 months
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Account
              </Button>
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-muted-foreground underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Form>
        </Formik>
      </Card>
    </div>
  );
};

const GoogleLogo = () => (
  <svg
    width="1.2em"
    height="1.2em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="size-lg inline-block shrink-0 align-sub text-[inherit]"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M15.6823 8.18368C15.6823 7.63986 15.6382 7.0931 15.5442 6.55811H7.99829V9.63876H12.3194C12.1401 10.6323 11.564 11.5113 10.7203 12.0698V14.0687H13.2983C14.8122 12.6753 15.6823 10.6176 15.6823 8.18368Z"
        fill="#4285F4"
      />
      <path
        d="M7.99812 16C10.1558 16 11.9753 15.2915 13.3011 14.0687L10.7231 12.0698C10.0058 12.5578 9.07988 12.8341 8.00106 12.8341C5.91398 12.8341 4.14436 11.426 3.50942 9.53296H0.849121V11.5936C2.2072 14.295 4.97332 16 7.99812 16Z"
        fill="#34A853"
      />
      <path
        d="M3.50665 9.53295C3.17154 8.53938 3.17154 7.4635 3.50665 6.46993V4.4093H0.849292C-0.285376 6.66982 -0.285376 9.33306 0.849292 11.5936L3.50665 9.53295Z"
        fill="#FBBC04"
      />
      <path
        d="M7.99812 3.16589C9.13867 3.14825 10.241 3.57743 11.067 4.36523L13.3511 2.0812C11.9048 0.723121 9.98526 -0.0235266 7.99812 -1.02057e-05C4.97332 -1.02057e-05 2.2072 1.70493 0.849121 4.40932L3.50648 6.46995C4.13848 4.57394 5.91104 3.16589 7.99812 3.16589Z"
        fill="#EA4335"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="15.6825" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default Register;

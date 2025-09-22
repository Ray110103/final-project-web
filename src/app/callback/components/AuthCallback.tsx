// pages/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
export const dynamic = 'force-dynamic';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      try {
        if (token) {
          // Store token consistently (same as in useLogin)
          localStorage.setItem("token", token);
          localStorage.setItem("access_token", token);

          // Sign in with NextAuth for session management
          const result = await signIn("credentials", { 
            token, 
            redirect: false 
          });

          if (result?.ok) {
            toast.success("Login successful!");
            router.replace("/dashboard");
          } else {
            throw new Error("Failed to create session");
          }

        } else if (error) {
          // Handle specific OAuth errors
          let errorMessage = "Login failed!";
          
          switch (error) {
            case "oauth_failed":
              errorMessage = "OAuth authentication failed. Please try again.";
              break;
            case "oauth_error":
              errorMessage = "An error occurred during login. Please try again.";
              break;
            default:
              errorMessage = "Login failed. Please try again.";
          }

          toast.error(errorMessage);
          router.replace("/login");
        } else {
          // No token and no error - invalid callback
          toast.error("Invalid authentication callback");
          router.replace("/login");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("An error occurred while processing login");
        router.replace("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Processing Authentication
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete your login...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

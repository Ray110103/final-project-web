// app/verify-new-email/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle, XCircle, Building, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

export default function VerifyNewEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    const verifyNewEmail = async () => {
      const token = params.token as string;
      
      if (!token) {
        setStatus('error');
        setErrorMessage("Invalid verification link");
        return;
      }
      
      try {
        const { data } = await axiosInstance.post("/auth/verify-new-email", { token });
        toast.success(data.message || "Email successfully updated!");
        setStatus('success');
        
        // Redirect ke profile setelah 3 detik
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
        
      } catch (error: any) {
        const message = error.response?.data?.message || "Verification failed";
        toast.error(message);
        setErrorMessage(message);
        setStatus('error');
      }
    };

    verifyNewEmail();
  }, [params.token, router]);

  // Loading State
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Link>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Building className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">PropertyRent</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Verifying New Email</h2>
              <p className="text-muted-foreground">Please wait while we verify your new email address...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Link>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Building className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">PropertyRent</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">Email Successfully Updated!</h2>
                  <p className="text-muted-foreground">
                    Your email address has been successfully updated and verified. You can now use your new email address to login.
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Redirecting to your profile in 3 seconds...</strong>
                </p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => router.push("/profile")} className="w-full">
                  Go to Profile Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Login with New Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Error State
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Link>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">PropertyRent</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">Verification Failed</h2>
                <p className="text-muted-foreground mb-2">
                  {errorMessage || "The verification link is invalid or has expired."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please try updating your email again from your profile settings.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/profile")} 
                className="w-full"
              >
                Go to Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
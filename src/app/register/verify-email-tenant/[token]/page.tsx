"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader, CheckCircle, XCircle, Building, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import useVerifyEmailTenant from "../_hooks/useVerifyEmailTenant";
import useResendVerification from "../../_hooks/useResendVerification";

export default function TenantVerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  
  const { mutateAsync: verifyEmail } = useVerifyEmailTenant();
  const { mutateAsync: resendVerification, isPending: isResendPending } = useResendVerification();

  useEffect(() => {
    const token = params.token as string;
    
    if (token) {
      verifyEmail({ token })
        .then(() => setStatus('success'))
        .catch((error) => {
          setStatus('error');
          setErrorMessage(error?.response?.data?.message || "Verification failed");
        });
    } else {
      setStatus('error');
      setErrorMessage("Invalid verification link");
    }
  }, [params.token, verifyEmail]);

  const handleResendVerification = async () => {
    // Untuk resend, kita perlu email. Bisa tambahkan input atau redirect ke register page
    router.push("/register/tenant-register");
  };

  if (status === 'loading') {
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

          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Building className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">PropertyRent</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Memverifikasi Email</h2>
              <p className="text-muted-foreground">Mohon tunggu while kami memverifikasi akun tenant Anda...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (status === 'success') {
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
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">Email Terverifikasi!</h2>
                  <p className="text-muted-foreground">
                    Akun tenant Anda telah berhasil diverifikasi. Sekarang Anda dapat login sebagai penyewa properti.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => router.push("/login")} className="w-full">
                  Login Sekarang
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

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
                <h2 className="text-2xl font-semibold mb-2 text-foreground">Verifikasi Gagal</h2>
                <p className="text-muted-foreground mb-2">
                  {errorMessage || "Link verifikasi tidak valid atau sudah kedaluwarsa."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Silakan coba daftar ulang atau minta link verifikasi baru.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/register/tenant-register")} 
                className="w-full"
              >
                Daftar Ulang
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Coba Login
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push("/")}
                className="w-full text-sm"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
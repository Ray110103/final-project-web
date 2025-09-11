"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Building, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useVerifyEmail from "../_hooks/useVerifyEmail"

export default function VerifyEmailPage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: verifyEmail, isPending } = useVerifyEmail()

  const handleVerify = () => {
    if (!password) return alert("Please enter your password")
    verifyEmail(
      { token, password },
      {
        onSuccess: () => {
          router.push("/login")
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <Building className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">PropertyRent</span>
          </Link>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Verifikasi Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              Atur kata sandi Anda untuk menyelesaikan verifikasi email
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button onClick={handleVerify} disabled={isPending} className="w-full">
            {isPending ? "Memproses..." : "Verifikasi & Atur Kata Sandi"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Setelah verifikasi berhasil, Anda akan diarahkan ke halaman masuk
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

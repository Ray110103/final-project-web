"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Building, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import useVerifyEmail from "../_hooks/useVerifyEmail"

export default function VerifyEmailPage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()

  // State untuk password dan konfirmasi password
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({})

  const { mutate: verifyEmail, isPending } = useVerifyEmail()

  // Validasi password
  const validatePassword = (pwd: string) => {
    if (!pwd) return "Password wajib diisi"
    if (pwd.length < 6) return "Password minimal 6 karakter"
    return ""
  }

  // Validasi konfirmasi password
  const validateConfirmPassword = (pwd: string, confirmPwd: string) => {
    if (!confirmPwd) return "Konfirmasi password wajib diisi"
    if (pwd !== confirmPwd) return "Password tidak cocok"
    return ""
  }

  // Handle input change dengan validasi real-time
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const error = validatePassword(value)
    setErrors(prev => ({ ...prev, password: error }))
    
    // Re-validate confirm password jika sudah ada isinya
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(value, confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    const error = validateConfirmPassword(password, value)
    setErrors(prev => ({ ...prev, confirmPassword: error }))
  }

  // Fungsi untuk menangani verifikasi
  const handleVerify = () => {
    // Validasi final
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword)

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError
      })
      return
    }

    verifyEmail(
      { token, password },
      {
        onSuccess: () => {
          toast.success("Email berhasil diverifikasi! Silakan login.")
          router.push("/login")
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Verifikasi gagal!")
        }
      }
    )
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleVerify()
    }
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
          <CardHeader className="text-center space-y-4">
            <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
              <Building className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">PropertyRent</span>
            </Link>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">Verifikasi Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                Atur kata sandi Anda untuk menyelesaikan verifikasi email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Kata Sandi Baru
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi baru"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">Password minimal 6 karakter</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Konfirmasi Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Masukkan konfirmasi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleVerify} 
              disabled={isPending || !!errors.password || !!errors.confirmPassword || !password || !confirmPassword} 
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Verifikasi & Atur Kata Sandi"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Setelah verifikasi berhasil, Anda akan diarahkan ke halaman login
            </p>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Sudah punya akun? Login di sini
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
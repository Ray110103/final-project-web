import Link from "next/link"
import { Building, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8" />
              <span className="font-bold text-xl">PropertyRent</span>
            </div>
            <p className="text-sm opacity-90">
              Platform terpercaya untuk menemukan penginapan terbaik di seluruh Indonesia. Nikmati pengalaman booking
              yang mudah dan aman.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:opacity-80 transition-opacity">
                  Cari Properti
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:opacity-80 transition-opacity">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-80 transition-opacity">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:opacity-80 transition-opacity">
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Untuk Pengguna</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:opacity-80 transition-opacity">
                  Daftar Akun
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:opacity-80 transition-opacity">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:opacity-80 transition-opacity">
                  Riwayat Booking
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:opacity-80 transition-opacity">
                  Favorit
                </Link>
              </li>
              <li>
                <Link href="/tenant/register" className="hover:opacity-80 transition-opacity">
                  Daftar Sebagai Tenant
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Kontak Kami</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Jl. Sudirman No. 123
                  <br />
                  Jakarta Pusat, 10220
                  <br />
                  Indonesia
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@propertyrent.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm opacity-90">© 2024 PropertyRent. Semua hak dilindungi.</div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">
                Syarat & Ketentuan
              </Link>
              <Link href="/cookies" className="hover:opacity-80 transition-opacity">
                Kebijakan Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
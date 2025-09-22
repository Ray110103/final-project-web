"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Building } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  // Check for the token when the component mounts
  useEffect(() => {
    // Check for access token in localStorage or sessionStorage
    const token = localStorage.getItem("access_token")

    if (token) {
      // You can replace this with decoding the token to get the user info (using JWT decode, for example)
      setUser({ name: "John Doe" }) // Set user info based on token or decoded JWT data
    }
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogout = () => {
    // Remove token on logout
    localStorage.removeItem("access_token")
    setUser(null) // Clear user state
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">PropertyRent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-1 text-foreground hover:text-accent transition-colors">
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </Link>
            <Link href="/property" className="text-foreground hover:text-accent transition-colors">
              Properti
            </Link>
            <Link href="/about-us" className="text-foreground hover:text-accent transition-colors">
              Tentang Kami
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Daftar</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Menu className="h-5 w-5 text-foreground" /> {/* Ikon garis tiga */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              <Link
                href="/"
                onClick={toggleMenu}
                className="flex items-center space-x-2 px-3 py-2 text-foreground hover:text-accent transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Beranda</span>
              </Link>
              <Link
                href="/property"
                onClick={toggleMenu}
                className="block px-3 py-2 text-foreground hover:text-accent transition-colors"
              >
                Properti
              </Link>
              <Link
                href="/about-us"
                onClick={toggleMenu}
                className="block px-3 py-2 text-foreground hover:text-accent transition-colors"
              >
                Tentang Kami
              </Link>

              {/* Auth Section Mobile */}
              <div className="flex flex-col space-y-2 px-3 py-2">
                {!user ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/login" onClick={toggleMenu}>
                        Masuk
                      </Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href="/register" onClick={toggleMenu}>
                        Daftar
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/profile" onClick={toggleMenu}>
                        Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/dashboard" onClick={toggleMenu}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleLogout()
                        toggleMenu()
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

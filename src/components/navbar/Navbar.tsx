"use client";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "../ModeToggle";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  const logout = () => {
    signOut();
  };
  return (
    <>
      {/* Fixed Top Navbar - Above everything */}
      <nav className="fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-between gap-4 border-b border-gray-700 bg-black/95 px-6 py-4 text-sm backdrop-blur supports-[backdrop-filter]:bg-black/60">
        {/* Left side - Logo and Desktop Sidebar Trigger */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/">
            <p className="text-xl font-bold text-white md:text-2xl">
              OTO{" "}
              <span className="bg-[linear-gradient(to_left,_#df8908_10%,_#ff1d15_100%)] bg-clip-text font-bold text-transparent">
                EVENT
              </span>
            </p>
          </Link>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted relative h-9 w-9 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              3
            </span>
          </Button>
          {/* Desktop Controls (Hidden on mobile) */}
          <div className="items-center gap-3 md:flex">
            <div className="flex items-center gap-4">
              {session.data?.user ? (
                <>
                  
                  {/* Profile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hover:bg-muted relative h-9 w-9 rounded-full transition-colors"
                      >
                        <Avatar className="ring-background h-8 w-8 ring-2">
                          <AvatarImage
                            src={session?.data?.user.profilePicture || ""}
                            alt={session?.data?.user.name || "User"}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {session?.data?.user.name
                              ? session?.data?.user.name
                                  .substring(0, 2)
                                  .toUpperCase()
                              : "UN"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-64 p-2"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="p-3 font-normal">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                session?.data?.user.profilePicture ||
                                "/avatar.png"
                              }
                              alt={session?.data?.user.name || "User"}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {session?.data?.user.name
                                ? session?.data?.user.name
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "UN"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm leading-none font-medium">
                              {session?.data?.user.name || "John Doe"}
                            </p>
                            <p className="text-muted-foreground text-xs leading-none">
                              {session?.data?.user.email ||
                                "john.doe@example.com"}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      {/* Rest of the dropdown menu items remain the same */}
                      <DropdownMenuSeparator className="my-2" />
                      <Link href={"/dashboard"}>
                        <DropdownMenuItem className="hover:bg-muted cursor-pointer rounded-md p-3 transition-colors">
                          <span className="flex items-center gap-2">
                            ⚙️ Dashboard
                          </span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href={"/tickets"}>
                        <DropdownMenuItem className="hover:bg-muted cursor-pointer rounded-md p-3 transition-colors">
                          <span className="flex items-center gap-2">
                            💳 Tickets
                          </span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href={"/points"}>
                        <DropdownMenuItem className="hover:bg-muted cursor-pointer rounded-md p-3 transition-colors">
                          <span className="flex items-center gap-2">
                            🪙 Points
                          </span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href={"/profile"}>
                        <DropdownMenuItem className="hover:bg-muted cursor-pointer rounded-md p-3 transition-colors">
                          <span className="flex items-center gap-2">
                            👤 Profile
                          </span>
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem
                        className="cursor-pointer rounded-md p-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        onClick={logout}
                      >
                        <span className="flex items-center gap-2">
                          🚪 Log out
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">Sign in</Link>
                  <Link href="/register">Sign up</Link>
                </>
              )}
            </div>
          </div>
          <div className="lg:hidden">
            <Sidebar />
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar - Fixed left side below navbar */}

      {/* Mobile Sidebar - Handled within the Sidebar component */}
    </>
  );
};

export default Navbar;

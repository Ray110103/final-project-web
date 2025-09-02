"use client";

import { lato } from "@/lib/fonts";
import { useAuthStore } from "@/stores/auth";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import { log } from "console";

const Navbar = () => {
  const session = useSession();

  const logout = () => {
    signOut();
  };

  return (
    <nav className="container mx-auto p-4 flex justify-between items-center ">
      <Link href="/">
        <p className={`text-3xl font-bold ${lato.className}`}>BlogGo</p>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        {session.data?.user ? (
          <>
            <Link href="/write">Write</Link>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/sign-up">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import Button from "@/components/ui/button/Button";
import { useIsLoggedIn } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AuthButtons: React.FC = () => (
  <div className="flex items-center gap-3">
    <Link href="/signin">
      <Button
        size="sm"
        variant="outline"
        className="px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Sign In
      </Button>
    </Link>

    <Link href="/signup">
      <Button
        size="sm"
        variant="primary"
        className="px-6 py-2 rounded-lg text-sm font-medium"
      >
        Sign Up
      </Button>
    </Link>
  </div>
);

const AppHeader: React.FC = () => {
  const isActiveLoggedIn = useIsLoggedIn();

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 z-50">
      <div className="flex items-center justify-between w-full px-4 py-3 xl:px-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            width={154}
            height={32}
            className="dark:hidden"
            src="./images/logo/logo.svg"
            alt="Logo"
          />
          <Image
            width={154}
            height={32}
            className="hidden dark:block"
            src="./images/logo/logo-dark.svg"
            alt="Logo"
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {!isActiveLoggedIn && <AuthButtons />}
          <ThemeToggleButton />
          {isActiveLoggedIn && <UserDropdown />}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

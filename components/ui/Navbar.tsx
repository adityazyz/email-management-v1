'use client';
import React from "react";
import { MdMarkEmailRead } from "react-icons/md";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton, // to show user profile options
  useUser, // to access user state
  OrganizationSwitcher, // to show organisation management options
  useOrganization // to access organization state
} from "@clerk/nextjs";

function Navbar() {

  const { isSignedIn, user, isLoaded } = useUser();
  const { membership } = useOrganization();

  if (user) {
    console.log(user); 
  }

  if (membership) {
    console.log(membership); 
  }
  
  return (
    <nav className="fixed top-0 border-solid border-gray-200 w-full border-b py-3 bg-white z-50 bg-inherit">
      <div className="container mx-auto">
        <div className="w-full flex flex-col lg:flex-row">
          <div className="flex justify-between w-full lg:flex-row">
            <div className="flex items-center justify-start">
              <Link href="/" className="flex items-center">
                <MdMarkEmailRead className="w-10 h-10  bg-clip-text text-[#AB47BC]" />
              </Link>
              <p className="text-lg text-gray-800 font-bold ml-4">Email Automation</p>
            </div>

            <p className="text-gray-600 text-sm font-medium hidden lg:block">
              Automate your email tasks with ease. {`Welcome ${isLoaded && isSignedIn ? user.firstName : "Guest"}!`}
            </p>

            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
              <OrganizationSwitcher />
                <UserButton />
              </SignedIn>
            </header>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

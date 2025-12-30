"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ShoppingBag, Menu, X, Search } from "lucide-react";
import { NAV_LINKS } from "../../lib/constants";
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b-[4px] border-t-[4px] border-[#1c524f] bg-white/95 backdrop-blur-sm shadow-sm font-sans">
      <div className="w-full px-6 lg:px-12 h-16 flex items-center justify-between">

        {/* 1. Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* 2. Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight uppercase">
          Attitude<span className="text-[#1c524f] text-sm ml-0.5">PK</span>
        </Link>

        {/* 3. Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative group">
              <Link
                href={link.href}
                className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#1c524f] transition-colors"
              >
                {link.label}
                {link.isDropdown && <ChevronDown className="w-4 h-4" />}
              </Link>

              {/* Dropdown Menu */}
              {link.isDropdown && (
                <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border shadow-lg rounded-md overflow-hidden min-w-[220px] flex flex-col p-2">
                    {link.subCategories?.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1c524f] rounded-md"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 4. Right Side Icons */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Search className="w-5 h-5" />
          </button>

          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative text-gray-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#1c524f] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* 5. Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t absolute w-full left-0 p-4 flex flex-col gap-4 shadow-lg h-screen z-50">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className="font-bold block py-2 text-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>

              {link.isDropdown && (
                <div className="pl-4 flex flex-col gap-2 mt-1 border-l-2 border-gray-100">
                  {link.subCategories?.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className="text-sm text-gray-500 py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
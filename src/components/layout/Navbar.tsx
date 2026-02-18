import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';
'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-xl">EduManage NG</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/features" className="hover:bg-green-600 px-3 py-2 rounded-md">Features</Link>
            <Link href="/about" className="hover:bg-green-600 px-3 py-2 rounded-md">About</Link>
            <Link href="/login" className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-md">Login</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/features" className="block hover:bg-green-600 px-3 py-2 rounded-md">Features</Link>
            <Link href="/about" className="block hover:bg-green-600 px-3 py-2 rounded-md">About</Link>
            <Link href="/login" className="block bg-green-500 hover:bg-green-400 px-3 py-2 rounded-md">Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
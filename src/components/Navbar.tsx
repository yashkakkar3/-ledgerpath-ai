'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { href: '/game', label: 'Game', emoji: '🎮' },
    { href: '/learn', label: 'Learn', emoji: '📚' },
    { href: '/leaderboard', label: 'Leaderboard', emoji: '🏆' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b11]/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-sm flex items-center gap-1">
              LedgerPath <span className="text-indigo-400 font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop User Info & Sign Out */}
        <div className="hidden md:flex items-center gap-3">
          {userEmail && (
            <div className="text-xs text-gray-400 font-mono bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="max-w-[140px] truncate">{userEmail}</span>
            </div>
          )}
          <LogoutButton />
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 border border-white/10 transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Drawer (375px responsiveness) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#080b11]/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                      : 'bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            {userEmail && (
              <div className="text-[11px] text-gray-400 font-mono truncate max-w-[180px]">
                {userEmail}
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  )
}

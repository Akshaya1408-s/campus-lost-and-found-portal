import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemsContext';
import {
  Compass,
  PlusCircle,
  Search,
  Shield,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Server,
  Layers,
  Sparkles,
  ChevronDown,
  Bell
} from 'lucide-react';
import { SpringSpecModal } from '../common/SpringSpecModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isFirebaseUser, logout, switchRole, signInWithGoogle } = useAuth();
  const { claims, items } = useItems();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [specModalOpen, setSpecModalOpen] = useState(false);

  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
  const myClaimsCount = claims.filter((c) => c.claimantEmail?.toLowerCase() === user?.email?.toLowerCase()).length;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-sky-500/20 text-sky-300 font-bold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        {/* Top Mini University Banner */}
        <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-1 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>University Department of Public Safety &amp; Student Services</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline">Campus Emergency Desk: (555) 019-SAFE</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Firebase Live Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[11px] font-mono border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firestore: Connected</span>
            </div>

            {/* Architecture specs button */}
            <button
              onClick={() => setSpecModalOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-mono transition-colors"
              title="Inspect Full-Stack Backend Architecture"
            >
              <Server className="w-3 h-3 text-sky-400" />
              <span>Backend Specs</span>
            </button>

            {/* Quick Role Switcher for College Project Reviewers */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
              >
                <span className="text-slate-400">View As:</span>
                <span className="font-semibold text-white">
                  {isAdmin ? 'Campus Admin' : user ? 'Student' : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-slate-800 text-xs z-50 animate-in fade-in"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Quick Role Toggle (Demo)
                  </div>
                  <button
                    onClick={() => switchRole('student')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Student Portal</div>
                      <div className="text-[10px] text-slate-600">Alex Rivera (STU-88421)</div>
                    </div>
                    {!isAdmin && user && <span className="text-sky-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Admin / Campus Safety</div>
                      <div className="text-[10px] text-slate-600">Officer Raymond Vance</div>
                    </div>
                    {isAdmin && <span className="text-sky-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => switchRole('guest')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 border-t border-slate-100"
                  >
                    <span>Logged Out / Guest</span>
                  </button>
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 leading-snug">
                    Note: To persist real reports &amp; claims to Cloud Firestore, sign in via Google. For admin writes, sign in with lrsakshaya@gmail.com.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white font-heading">
                  CAMPUS <span className="text-sky-400">LOST &amp; FOUND</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-medium">
                Official University Recovery Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/browse" className={navLinkClass('/browse')}>
              <Search className="w-3.5 h-3.5" />
              Browse Items
            </Link>
            <Link to="/report?type=lost" className={navLinkClass('/report')}>
              <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
              Report Lost
            </Link>
            <Link to="/report?type=found" className={navLinkClass('/report?type=found')}>
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Report Found
            </Link>

            {/* Student Dashboard link */}
            {user && (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <User className="w-3.5 h-3.5" />
                Student Dashboard
                {myClaimsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[10px]">
                    {myClaimsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Dashboard link */}
            {isAdmin && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Console
                {pendingClaimsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {pendingClaimsCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* User Auth Controls & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    <span>{user?.name}</span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-400/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {user?.studentId}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign-In</span>
                </button>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Browse Items
            </Link>
            <Link
              to="/report?type=lost"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 hover:bg-slate-800"
            >
              Report Lost Item
            </Link>
            <Link
              to="/report?type=found"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-300 hover:bg-slate-800"
            >
              Report Found Item
            </Link>

            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-sky-300 hover:bg-slate-800"
              >
                Student Dashboard ({myClaimsCount} claims)
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-300 hover:bg-slate-800"
              >
                Admin Console ({pendingClaimsCount} pending)
              </Link>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-xs font-bold text-white">{user?.name}</div>
                    <div className="text-[10px] text-slate-400">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1 bg-slate-800 text-xs font-semibold rounded-lg text-slate-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-slate-800 text-xs font-semibold rounded-lg text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-sky-600 text-xs font-semibold rounded-lg text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spring Boot Specs Modal */}
      <SpringSpecModal isOpen={specModalOpen} onClose={() => setSpecModalOpen(false)} />
    </>
  );
};

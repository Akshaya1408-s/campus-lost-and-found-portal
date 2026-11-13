import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Clock, MapPin, Phone, Mail, RotateCcw, Server } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';
import { SpringSpecModal } from '../common/SpringSpecModal';

export const Footer: React.FC = () => {
  const { resetAllData } = useItems();
  const [specOpen, setSpecOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-bold text-white text-base tracking-tight font-heading">
                  CAMPUS <span className="text-sky-400">LOST &amp; FOUND</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                The centralized repository connecting university students, staff, and faculty to recover lost possessions safely on campus.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Safe Custody Protocol
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home Portal
                  </Link>
                </li>
                <li>
                  <Link to="/browse" className="hover:text-white transition-colors">
                    Browse Reported Items
                  </Link>
                </li>
                <li>
                  <Link to="/report?type=lost" className="hover:text-rose-400 transition-colors">
                    Report a Lost Item
                  </Link>
                </li>
                <li>
                  <Link to="/report?type=found" className="hover:text-emerald-400 transition-colors">
                    Report a Found Item
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-sky-400 transition-colors">
                    Student Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Campus Safety Desk Info */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Campus Safety Office
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Student Services Building, Room 102 (Central Campus)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p className="text-slate-500">Sat: 10:00 AM - 2:00 PM</p>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>(555) 890-SAFE / Ext. 4200</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>lostfound@campus.edu</span>
                </li>
              </ul>
            </div>

            {/* Project Architecture & Development Tools */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                Full-Stack Architecture
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                College Project Design: Decoupled React frontend with a clean REST service layer matching Spring Boot 3.x + Spring Data JPA + MySQL.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSpecOpen(true)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Server className="w-3.5 h-3.5" />
                  View Spring Boot API Contracts
                </button>

                <button
                  type="button"
                  onClick={resetAllData}
                  className="w-full py-2 px-3 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Resets local mock items & claims to original sample set"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Sample Data
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} University Campus Lost &amp; Found Portal. For academic evaluation.</p>
            <p className="flex items-center gap-3">
              <span>Frontend: React 19 + TypeScript + Tailwind CSS</span>
              <span>•</span>
              <span>Backend Target: Java Spring Boot + MySQL</span>
            </p>
          </div>
        </div>
      </footer>

      <SpringSpecModal isOpen={specOpen} onClose={() => setSpecOpen(false)} />
    </>
  );
};

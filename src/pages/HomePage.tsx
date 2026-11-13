import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import { ITEM_CATEGORIES } from '../data/mockData';
import { ItemCard } from '../components/common/ItemCard';
import { ItemDetailModal } from '../components/common/ItemDetailModal';
import { ClaimModal } from '../components/common/ClaimModal';
import { LostFoundItem } from '../types';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Sparkles,
  HelpCircle,
  Building2,
  Tag
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, stats, loading } = useItems();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recentTab, setRecentTab] = useState<'all' | 'lost' | 'found'>('all');

  // Modals state
  const [viewItem, setViewItem] = useState<LostFoundItem | null>(null);
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/browse?${params.toString()}`);
  };

  const filteredRecent = items
    .filter((item) => {
      if (recentTab === 'lost') return item.type === 'lost';
      if (recentTab === 'found') return item.type === 'found';
      return true;
    })
    .slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 px-4 sm:px-6">
        {/* Subtle background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-sky-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            Official Campus Safety &amp; Student Property Recovery System
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading max-w-4xl mx-auto leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-sky-200 to-blue-400">
              We Help You Find It Fast.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Search hundreds of verified items logged across university halls, report lost gear, or claim found belongings with official campus safety verification.
          </p>

          {/* Hero Quick Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-3xl mx-auto bg-white p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/40 text-slate-800 flex flex-col sm:flex-row items-center gap-2 mt-8"
          >
            <div className="flex items-center gap-2 flex-1 w-full px-3 py-1.5">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personal items (e.g. Keys, College ID, Gold chain, iPad, Wallet)..."
                className="w-full text-sm font-medium focus:outline-hidden text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="w-full sm:w-auto h-px sm:h-8 bg-slate-200 sm:w-px"></div>

            <div className="w-full sm:w-48 px-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-semibold text-slate-600 focus:outline-hidden bg-transparent py-2 cursor-pointer"
              >
                <option value="">All Categories</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl sm:rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/report?type=lost"
              className="px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report?type=found"
              className="px-5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Link>
            <Link
              to="/browse"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Full Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          CAMPUS STATISTICS BAR
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 border-r border-slate-100 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {loading ? '...' : stats.totalReported}
              </div>
              <div className="text-xs text-slate-500 font-medium">Total Items Logged</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {loading ? '...' : stats.itemsReunited}
              </div>
              <div className="text-xs text-slate-500 font-medium">Reunited With Owners</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 last:border-none">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {loading ? '...' : stats.activeClaims}
              </div>
              <div className="text-xs text-slate-500 font-medium">Pending Claim Reviews</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                14+
              </div>
              <div className="text-xs text-slate-500 font-medium">Campus Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          RECENTLY REPORTED ITEMS
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Live Campus Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              Recently Reported Items
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Check listings posted by students, professors, and campus custodians in the past 7 days.
            </p>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setRecentTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                recentTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setRecentTab('lost')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                recentTab === 'lost' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Only ({items.filter((i) => i.type === 'lost').length})
            </button>
            <button
              onClick={() => setRecentTab('found')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                recentTab === 'found' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Only ({items.filter((i) => i.type === 'found').length})
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredRecent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecent.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={(it) => setViewItem(it)}
                onClaimItem={(it) => setClaimItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">No items in this category</h4>
            <p className="text-xs text-slate-500 mt-1">Check back later or search with other keywords.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 shadow-xs transition-colors"
          >
            Explore All Campus Listings
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </Link>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS
          ========================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
              How the Campus Recovery System Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Designed according to University Student Affairs &amp; Campus Public Safety guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg font-heading mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Report or Search
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lost an item? Submit a detailed report with photos, location, and date. Found an item? Log it or drop it off at any authorized front desk.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" /> Generates unique tracking ID
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg font-heading mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Verify Ownership
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Found items are kept securely in safety vaults. To claim, describe unpublicized identifying marks, serial numbers, or lockscreen wallpapers.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Confidential security review
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg font-heading mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Collect Your Possession
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once Campus Safety approves your claim, present your University ID at Student Services Building Room 102 to retrieve your belonging.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reunited with full custody log
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CAMPUS SAFETY DESK & DROP-OFF BANNER
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Official Drop-Off Location
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Found Valuables on Campus?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wallets, credit cards, laptops, and student IDs should be surrendered directly to the 
              <strong> Campus Safety &amp; Student Services Office (Room 102)</strong> or handed to building security guards immediately for safe custody.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" /> Room 102, Student Services Center
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> Mon - Fri: 8:00 AM - 6:00 PM
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              to="/report?type=found"
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors text-center shadow-lg"
            >
              Log a Found Item Online
            </Link>
            <Link
              to="/browse"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors text-center"
            >
              Browse Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* Item Modals */}
      <ItemDetailModal
        item={viewItem}
        onClose={() => setViewItem(null)}
        onClaim={(it) => {
          setViewItem(null);
          setClaimItem(it);
        }}
      />

      <ClaimModal
        item={claimItem}
        onClose={() => setClaimItem(null)}
      />
    </div>
  );
};

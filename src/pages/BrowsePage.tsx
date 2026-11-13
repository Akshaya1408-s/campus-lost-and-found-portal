import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import { ItemCard } from '../components/common/ItemCard';
import { ItemDetailModal } from '../components/common/ItemDetailModal';
import { ClaimModal } from '../components/common/ClaimModal';
import { LostFoundItem, ItemType, ItemStatus, ItemCategory } from '../types';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../data/mockData';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading } = useItems();

  // URL query params initialization
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Modals
  const [viewItem, setViewItem] = useState<LostFoundItem | null>(null);
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);

  // Sync state if URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
    const t = searchParams.get('type');
    if (t !== null) setSelectedType(t);
  }, [searchParams]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Location
      if (selectedLocation !== 'all' && item.location !== selectedLocation) return false;
      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchRef = item.referenceNo.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat && !matchRef) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime();
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [items, selectedType, selectedCategory, selectedLocation, selectedStatus, searchQuery, sortBy]);

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedCategory !== 'all',
    selectedLocation !== 'all',
    selectedStatus !== 'all',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedStatus('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Campus Lost &amp; Found Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search and filter all currently logged belongings across academic buildings and dorms.
          </p>
        </div>

        {/* View Mode & Active Counts */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredItems.length}</span> of {items.length} items
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Search & Quick Type Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, model, color, locker, or reference ID..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Toggle Pills (All, Lost, Found) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'lost'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Lost Items ({items.filter((i) => i.type === 'lost').length})
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'found'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Found Items ({items.filter((i) => i.type === 'found').length})
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {/* Scrollable Quick Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns Bar */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 ${
          showFiltersMobile ? 'block' : 'hidden sm:grid'
        }`}>
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Location Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Campus Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Item Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Unclaimed</option>
              <option value="claim_pending">Claim In Review</option>
              <option value="claimed">Reunited &amp; Collected</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
            >
              <option value="newest">Most Recent Date</option>
              <option value="oldest">Oldest Date</option>
              <option value="title-asc">Item Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px]">Applied filters:</span>

            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Type: {selectedType.toUpperCase()}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('all')} />
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
              </span>
            )}

            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Location: {selectedLocation}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocation('all')} />
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('all')} />
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Search: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Items Listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-3'
          }
        >
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              layout={viewMode}
              onViewDetails={(it) => setViewItem(it)}
              onClaimItem={(it) => setClaimItem(it)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching campus items found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn't find any items matching your active search filters. Try widening your criteria, checking other categories, or logging a new report.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
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

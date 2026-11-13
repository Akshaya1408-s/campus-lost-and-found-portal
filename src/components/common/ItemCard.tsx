import React from 'react';
import { LostFoundItem } from '../../types';
import { Badge } from './Badge';
import { MapPin, Calendar, Tag, ShieldCheck, Gift, ArrowRight } from 'lucide-react';

interface ItemCardProps {
  item: LostFoundItem;
  onViewDetails: (item: LostFoundItem) => void;
  onClaimItem?: (item: LostFoundItem) => void;
  layout?: 'grid' | 'list';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onClaimItem,
  layout = 'grid',
}) => {
  const isLost = item.type === 'lost';

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between group">
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 font-mono text-xs">
                No Photo
              </div>
            )}
            <div className="absolute top-1.5 left-1.5">
              <Badge variant={isLost ? 'lost' : 'found'} size="sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {item.referenceNo}
              </span>
              <Badge status={item.status} size="sm" />
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                <Tag className="w-3 h-3 text-slate-600" />
                {item.category}
              </span>
            </div>

            <h3
              onClick={() => onViewDetails(item)}
              className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors cursor-pointer truncate"
            >
              {item.title}
            </h3>

            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-700" />
                <span className="truncate max-w-[200px]">{item.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>{item.dateReported}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => onViewDetails(item)}
            className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            View Details
          </button>
          {!isLost && item.status === 'open' && onClaimItem && (
            <button
              onClick={() => onClaimItem(item)}
              className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-xs"
            >
              Claim Item
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <Tag className="w-8 h-8 stroke-1 text-slate-400 mb-1" />
            <span className="text-xs">No image provided</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={isLost ? 'lost' : 'found'} />
          <Badge status={item.status} size="sm" />
        </div>

        {/* Reward pill if any */}
        {item.rewardOffered && (
          <div className="absolute bottom-3 right-3 bg-amber-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-sm">
            <Gift className="w-3 h-3" />
            {item.rewardOffered}
          </div>
        )}

        {/* Safe custody note */}
        {item.heldAtOffice && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            Campus Safety Vault
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {item.referenceNo}
          </span>
          <span className="text-slate-600 font-medium">
            {item.category}
          </span>
        </div>

        <h3
          onClick={() => onViewDetails(item)}
          className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors cursor-pointer line-clamp-1 mb-1.5"
          title={item.title}
        >
          {item.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{isLost ? 'Lost on' : 'Found on'} {item.dateReported}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onViewDetails(item)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            Details
            <ArrowRight className="w-3 h-3 text-slate-600" />
          </button>

          {!isLost && item.status === 'open' && onClaimItem && (
            <button
              onClick={() => onClaimItem(item)}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-xs hover:shadow text-center"
            >
              Claim Item
            </button>
          )}

          {isLost && item.status === 'open' && (
            <button
              onClick={() => onViewDetails(item)}
              className="py-2 px-2.5 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors text-center"
              title="Have you seen this?"
            >
              I Found This
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

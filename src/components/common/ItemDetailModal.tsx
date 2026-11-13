import React from 'react';
import { LostFoundItem } from '../../types';
import { Badge } from './Badge';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Gift,
  Mail,
  Phone,
  User,
  Share2,
  Copy,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useItems } from '../../context/ItemsContext';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  onClose: () => void;
  onClaim: (item: LostFoundItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onClaim,
}) => {
  const { addToast } = useItems();
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const isLost = item.type === 'lost';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(item.referenceNo);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Reference Copied',
      message: `${item.referenceNo} copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-800 text-sky-300 px-2.5 py-1 rounded-md border border-slate-700">
              {item.referenceNo}
            </span>
            <Badge variant={isLost ? 'lost' : 'found'} size="sm" />
            <Badge status={item.status} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRef}
              title="Copy Reference ID"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Photo or Graphic */}
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <Tag className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <span className="text-sm font-medium">No photograph attached to report</span>
              </div>
            )}

            {item.rewardOffered && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Reward Offered: {item.rewardOffered}
              </div>
            )}
          </div>

          {/* Title and Category */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 uppercase tracking-wider mb-1">
              <span>{item.category}</span>
              <span>•</span>
              <span>Reported on {item.dateReported}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>
          </div>

          {/* Location & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-600 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-700" /> Primary Location
              </span>
              <p className="font-semibold text-slate-800 text-sm">{item.location}</p>
              {item.specificLocation && (
                <p className="text-slate-600 text-xs italic">{item.specificLocation}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-slate-600 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-600" /> Date Logged
              </span>
              <p className="font-semibold text-slate-800 text-sm">{item.dateReported}</p>
              <p className="text-slate-600 text-xs">Ref: {item.referenceNo}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Item Description &amp; Identifying Details
            </h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* Custody Info if found */}
          {item.heldAtOffice && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-950 text-sm">Physical Custody Verification</p>
                <p className="mt-0.5 text-sky-900 leading-relaxed">
                  This item is currently safely secured at the Campus Safety &amp; Student Services Office.
                  {item.lockerNumber && <strong> Location: {item.lockerNumber}.</strong>}
                  To pick it up, submit an ownership claim and bring your student/photo ID.
                </p>
              </div>
            </div>
          )}

          {/* Reporter Contact Info */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Logged By
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-medium">{item.reporterName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>{item.reporterEmail}</span>
              </div>
              {item.reporterPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>{item.reporterPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice for claims */}
          {!isLost && item.status === 'open' && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Claiming this item?</strong> You will be asked to describe private details
                (e.g., serial numbers, stickers, scratches, or lockscreen images) to verify legal ownership.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>

          {!isLost && item.status === 'open' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onClaim(item);
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Claim This Item
            </button>
          )}

          {isLost && item.status === 'open' && (
            <a
              href={`mailto:${item.reporterEmail}?subject=Found your ${encodeURIComponent(item.title)} (Ref: ${item.referenceNo})`}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              Contact Owner Directly
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

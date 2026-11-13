import React from 'react';
import { ItemType, ItemStatus, ClaimStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'lost' | 'found' | 'status' | 'neutral';
  status?: ItemStatus | ClaimStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  if (variant === 'lost') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        {children || 'LOST'}
      </span>
    );
  }

  if (variant === 'found') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {children || 'FOUND'}
      </span>
    );
  }

  if (status) {
    switch (status) {
      case 'open':
        return (
          <span className={`inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses} ${className}`}>
            Active / Open
          </span>
        );
      case 'claim_pending':
      case 'pending':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
            Claim Pending
          </span>
        );
      case 'claimed':
      case 'collected':
        return (
          <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}>
            Reunited &amp; Collected
          </span>
        );
      case 'approved':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
            Claim Approved (Ready)
          </span>
        );
      case 'rejected':
      case 'closed':
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses} ${className}`}>
            {status === 'rejected' ? 'Claim Rejected' : 'Archived / Closed'}
          </span>
        );
      default:
        break;
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

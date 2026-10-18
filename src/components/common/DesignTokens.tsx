import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

// ============================================================================
// Skeleton Loaders
// ============================================================================

export const SkeletonListingCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-[#E2DFD8] overflow-hidden flex flex-col h-full shadow-2xs">
    {/* Aspect 4/3 image placeholder with shimmering gradient */}
    <div className="relative aspect-4/3 w-full bg-[#EFECE5] overflow-hidden novora-skeleton" />

    {/* Content matching ListingCard */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        {/* Category & Location metadata line */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 novora-skeleton rounded-md" />
          <div className="h-3 w-3 novora-skeleton rounded-full" />
          <div className="h-3 w-20 novora-skeleton rounded-md" />
        </div>

        {/* Title (2 lines) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="h-4 w-5/6 novora-skeleton rounded-md" />
          <div className="h-4 w-2/3 novora-skeleton rounded-md" />
        </div>

        {/* Description line */}
        <div className="pt-1 space-y-1">
          <div className="h-3 w-full novora-skeleton rounded-md" />
          <div className="h-3 w-4/5 novora-skeleton rounded-md" />
        </div>
      </div>

      {/* Footer: Price & Details button */}
      <div className="pt-3 border-t border-[#EFECE5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-5 w-20 novora-skeleton rounded-md" />
          <div className="h-2.5 w-14 novora-skeleton rounded-md" />
        </div>
        <div className="h-4 w-12 novora-skeleton rounded-md" />
      </div>
    </div>
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
    <div className="bg-white rounded-2xl border border-[#E2DFD8] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="w-24 h-24 rounded-full bg-[#EFECE5] shrink-0" />
      <div className="space-y-3 flex-1">
        <div className="h-6 bg-[#E2DFD8] rounded-md w-1/3" />
        <div className="h-4 bg-[#EFECE5] rounded-md w-1/2" />
        <div className="h-4 bg-[#EFECE5] rounded-md w-2/3" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonListingCard />
      <SkeletonListingCard />
      <SkeletonListingCard />
    </div>
  </div>
);

export const SkeletonStorefront: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-pulse">
    <div className="w-full h-48 sm:h-64 rounded-2xl bg-[#E2DFD8]" />
    <div className="flex flex-col sm:flex-row gap-4 items-center -mt-16 sm:-mt-20 px-6">
      <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-md border border-[#E2DFD8]">
        <div className="w-full h-full rounded-xl bg-[#EFECE5]" />
      </div>
      <div className="space-y-2 text-center sm:text-left flex-1">
        <div className="h-6 bg-[#E2DFD8] rounded-md w-48 mx-auto sm:mx-0" />
        <div className="h-4 bg-[#EFECE5] rounded-md w-72 mx-auto sm:mx-0" />
      </div>
    </div>
    <div className="h-10 bg-[#EFECE5] rounded-xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      <SkeletonListingCard />
      <SkeletonListingCard />
      <SkeletonListingCard />
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#E2DFD8] p-6 space-y-4 animate-pulse">
    <div className="h-5 bg-[#E2DFD8] rounded-md w-1/4" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-[#F7F5F0] rounded-xl flex items-center justify-between px-4">
          <div className="h-4 bg-[#E2DFD8] rounded-md w-1/3" />
          <div className="h-4 bg-[#E2DFD8] rounded-md w-1/6" />
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// Empty State & Error State
// ============================================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ''
}) => (
  <div className={`text-center py-12 px-6 rounded-2xl border border-dashed border-[#E2DFD8] bg-[#F7F5F0] flex flex-col items-center justify-center space-y-3.5 transition-all ${className}`}>
    {Icon && (
      <div className="w-12 h-12 rounded-xl bg-white border border-[#E2DFD8] shadow-2xs flex items-center justify-center text-[#283548]">
        <Icon className="w-6 h-6 text-[#C5A572]" />
      </div>
    )}
    <h4 className="text-base font-semibold text-[#14243A]">
      {title}
    </h4>
    <p className="text-xs sm:text-sm text-[#5A6578] max-w-md leading-relaxed">
      {description}
    </p>
    {(actionText || secondaryActionText) && (
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#14243A] hover:bg-[#0E1B2D] rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-[#14243A] hover:text-[#0E1B2D] bg-white hover:bg-[#F7F5F0] border border-[#E2DFD8] rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry
}) => (
  <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/50 text-center space-y-3 max-w-lg mx-auto my-8">
    <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
    <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-[0.98]"
      >
        Try Again
      </button>
    )}
  </div>
);

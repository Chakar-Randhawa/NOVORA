import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  showHomeIcon = true
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-2 px-1 text-xs text-[#5A6578] ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 leading-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;
          const Icon = item.icon || (index === 0 && showHomeIcon ? Home : undefined);

          if (isLast) {
            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-1 sm:gap-1.5 min-w-0"
                aria-current="page"
              >
                {Icon && (
                  <Icon
                    className="w-3.5 h-3.5 text-[#14243A] shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span
                  className="font-semibold text-[#14243A] truncate max-w-[180px] sm:max-w-[320px] md:max-w-[420px]"
                  title={item.label}
                >
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-[#5A6578] hover:text-[#14243A] transition-colors cursor-pointer rounded px-1 py-0.5 -mx-1 -my-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#14243A]/20"
                  title={`Navigate to ${item.label}`}
                >
                  {Icon && (
                    <Icon
                      className="w-3.5 h-3.5 text-[#C5A572] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[#5A6578]">
                  {Icon && (
                    <Icon
                      className="w-3.5 h-3.5 text-[#C5A572] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.label}</span>
                </span>
              )}
              <ChevronRight
                className="w-3 h-3 text-[#A0AEC0] shrink-0"
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

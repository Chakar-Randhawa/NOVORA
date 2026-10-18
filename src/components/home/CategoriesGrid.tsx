import React from 'react';
import {
  Hammer,
  Clock,
  Package,
  Download,
  Briefcase,
  Factory,
  Video,
  MapPin,
  ArrowRight,
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { Listing } from '../../types';

interface CategoriesGridProps {
  listings: Listing[];
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Hammer: <Hammer className="w-5 h-5 text-[#C5A572]" />,
  Clock: <Clock className="w-5 h-5 text-[#D97706]" />,
  Package: <Package className="w-5 h-5 text-[#059669]" />,
  Download: <Download className="w-5 h-5 text-[#283548]" />,
  Briefcase: <Briefcase className="w-5 h-5 text-[#14243A]" />,
  Factory: <Factory className="w-5 h-5 text-[#EA580C]" />,
  Video: <Video className="w-5 h-5 text-[#DC2626]" />,
  MapPin: <MapPin className="w-5 h-5 text-[#0284C7]" />
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  listings,
  onSelectCategory
}) => {
  return (
    <section id="categories" className="py-12 sm:py-16 bg-white border-b border-[#E2DFD8]">
      <div className="novora-container">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="text-xs font-semibold text-[#8E6D38] uppercase tracking-wider mb-1">
              Marketplace Taxonomy
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#14243A] tracking-tight">
              Browse by Category
            </h2>
          </div>
          <p className="text-xs text-[#5A6578] max-w-md leading-relaxed">
            Specialized listing structures designed for physical items, digital assets, professional deliverables, and community trade.
          </p>
        </div>

        {/* Categories Grid: fluid responsive intrinsic auto-fill */}
        <div className="novora-card-grid">
          {CATEGORIES.map((cat) => {
            const actualCount = listings.filter((l) => l.categoryId === cat.id && l.status === 'active').length;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 sm:p-5 rounded-2xl border border-[#E2DFD8] bg-[#F7F5F0] hover:bg-white hover:border-[#14243A] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2DFD8] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                    {ICON_MAP[cat.icon] || <Layers className="w-4 h-4 text-[#14243A]" />}
                  </div>

                  <h3 className="text-sm font-semibold text-[#14243A] group-hover:text-[#283548] transition-colors mb-1">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#5A6578] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2DFD8]/70 flex items-center justify-between text-xs text-[#5A6578]">
                  <span className="font-mono text-[11px] tabular-nums">
                    {actualCount === 0 ? '0 Listings' : `${actualCount} ${actualCount === 1 ? 'Listing' : 'Listings'}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#14243A] group-hover:text-[#C5A572]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

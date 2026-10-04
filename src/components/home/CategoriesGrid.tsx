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
  Hammer: <Hammer className="w-5 h-5 text-[#4057D6]" />,
  Clock: <Clock className="w-5 h-5 text-[#D97706]" />,
  Package: <Package className="w-5 h-5 text-[#059669]" />,
  Download: <Download className="w-5 h-5 text-[#7C3AED]" />,
  Briefcase: <Briefcase className="w-5 h-5 text-[#4B5563]" />,
  Factory: <Factory className="w-5 h-5 text-[#EA580C]" />,
  Video: <Video className="w-5 h-5 text-[#DC2626]" />,
  MapPin: <MapPin className="w-5 h-5 text-[#0284C7]" />
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  listings,
  onSelectCategory
}) => {
  return (
    <section id="categories" className="py-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-[#4057D6] uppercase tracking-wider mb-1">
              Marketplace Taxonomy
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#17191F] tracking-tight">
              Browse by Category
            </h2>
          </div>
          <p className="text-xs text-[#646B76] max-w-md leading-relaxed">
            Specialized listing structures designed for physical items, digital assets, professional deliverables, and community trade.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const actualCount = listings.filter(l => l.categoryId === cat.id && l.status === 'active').length;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] hover:bg-white hover:border-[#17191F] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {ICON_MAP[cat.icon] || <Layers className="w-4 h-4 text-[#17191F]" />}
                  </div>

                  <h3 className="text-sm font-semibold text-[#17191F] group-hover:text-[#4057D6] transition-colors mb-1">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#646B76] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB]/70 flex items-center justify-between text-xs text-[#646B76]">
                  <span className="font-mono text-[11px] tabular-nums">
                    {actualCount === 0 ? '0 Listings' : `${actualCount} ${actualCount === 1 ? 'Listing' : 'Listings'}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#17191F]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

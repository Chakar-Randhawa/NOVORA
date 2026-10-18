import React, { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Trash2, Eye, Lock } from 'lucide-react';
import { ReportItem, Listing, UserProfile } from '../../types';

interface AdminWorkspaceProps {
  currentUser: UserProfile | null;
  reports: ReportItem[];
  listings: Listing[];
  onResolveReport: (reportId: string, status: 'resolved' | 'dismissed') => void;
  onDeactivateListing: (listingId: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  currentUser,
  reports,
  listings,
  onResolveReport,
  onDeactivateListing,
  onSelectListing
}) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

  // Authorization check
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-[#E2DFD8] p-8 space-y-4 max-w-md mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#14243A]">Access Restricted</h3>
        <p className="text-xs text-[#5A6578] leading-relaxed">
          The Trust & Moderation Console is protected. You must be authenticated with platform administrator privileges to inspect community reports.
        </p>
      </div>
    );
  }

  const filteredReports = reports.filter(r => {
    if (filterStatus === 'pending') return r.status === 'pending';
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E2DFD8] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8E6D38] mb-1">
            <Shield className="w-4 h-4 text-[#C5A572]" />
            <span>Platform Governance & Integrity</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#14243A] tracking-tight">
            Trust & Moderation Console
          </h2>
          <p className="text-xs text-[#5A6578] mt-1 max-w-lg leading-relaxed">
            Review community reports, enforce prohibited item rules, and oversee platform integrity. Authenticated Moderator: {currentUser.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-[#F7F5F0] text-[#14243A] text-xs font-medium rounded-lg border border-[#E2DFD8]">
            Platform Architecture Verified
          </span>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white rounded-2xl border border-[#E2DFD8] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E2DFD8] flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#14243A]">Community Reports Queue</h3>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2DFD8]">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'pending' ? 'bg-[#14243A] shadow-xs text-white' : 'text-[#5A6578] hover:text-[#14243A]'
                }`}
              >
                Pending ({reports.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-[#14243A] shadow-xs text-white' : 'text-[#5A6578] hover:text-[#14243A]'
                }`}
              >
                All Reports ({reports.length})
              </button>
            </div>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="divide-y divide-[#E2DFD8]">
            {filteredReports.map(rep => {
              const targetListing = listings.find(l => l.id === rep.targetId);

              return (
                <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-rose-700 capitalize">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-[#5A6578]">·</span>
                      <span className="text-[#5A6578]">Target Type: {rep.targetType}</span>
                      <span className="text-[#5A6578]">·</span>
                      <span className="text-[#5A6578]">{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs font-medium text-[#14243A]">
                      "{rep.details}"
                    </p>

                    {targetListing && (
                      <p className="text-[11px] text-[#5A6578]">
                        Target Listing: <span className="font-semibold text-[#14243A]">{targetListing.title}</span> by {targetListing.sellerName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {targetListing && (
                      <button
                        onClick={() => onSelectListing(targetListing)}
                        className="px-3 py-1.5 text-xs font-medium text-[#14243A] bg-[#F7F5F0] hover:bg-[#EFECE6] border border-[#E2DFD8] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C5A572]" />
                        <span>Inspect Item</span>
                      </button>
                    )}

                    {rep.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 text-xs font-medium text-[#5A6578] hover:bg-[#F7F5F0] rounded-lg transition-colors cursor-pointer border border-[#E2DFD8]"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            if (targetListing) onDeactivateListing(targetListing.id);
                            onResolveReport(rep.id, 'resolved');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          Deactivate Listing
                        </button>
                      </>
                    )}

                    {rep.status !== 'pending' && (
                      <span className="text-xs font-medium text-[#5A6578] capitalize">
                        Status: {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-[#5A6578] space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold text-[#14243A]">No pending community reports</h4>
            <p className="text-xs text-[#5A6578]">
              All items in the marketplace are currently in compliance with community integrity guidelines.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

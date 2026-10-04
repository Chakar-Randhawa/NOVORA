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
      <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#17191F]">Access Restricted</h3>
        <p className="text-xs text-[#646B76] leading-relaxed">
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
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4057D6] mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Governance & Integrity</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#17191F] tracking-tight">
            Trust & Moderation Console
          </h2>
          <p className="text-xs text-[#646B76] mt-1 max-w-lg leading-relaxed">
            Review community reports, enforce prohibited item rules, and oversee platform integrity. Authenticated Moderator: {currentUser.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200">
            $0 Cost Architecture Verified
          </span>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#17191F]">Community Reports Queue</h3>
            <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#E5E7EB]">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'pending' ? 'bg-white shadow-xs text-[#17191F]' : 'text-[#646B76]'
                }`}
              >
                Pending ({reports.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white shadow-xs text-[#17191F]' : 'text-[#646B76]'
                }`}
              >
                All Reports ({reports.length})
              </button>
            </div>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredReports.map(rep => {
              const targetListing = listings.find(l => l.id === rep.targetId);

              return (
                <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-rose-700 capitalize">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-[#646B76]">·</span>
                      <span className="text-[#646B76]">Target Type: {rep.targetType}</span>
                      <span className="text-[#646B76]">·</span>
                      <span className="text-[#646B76]">{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs font-medium text-[#17191F]">
                      "{rep.details}"
                    </p>

                    {targetListing && (
                      <p className="text-[11px] text-[#646B76]">
                        Target Listing: <span className="font-semibold text-[#17191F]">{targetListing.title}</span> by {targetListing.sellerName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {targetListing && (
                      <button
                        onClick={() => onSelectListing(targetListing)}
                        className="px-3 py-1.5 text-xs font-medium text-[#4057D6] hover:bg-[#EEF2FF] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Item</span>
                      </button>
                    )}

                    {rep.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 text-xs font-medium text-[#646B76] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
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
                      <span className="text-xs font-medium text-[#646B76] capitalize">
                        Status: {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-[#646B76] space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold text-[#17191F]">No pending community reports</h4>
            <p className="text-xs text-[#646B76]">
              All items in the marketplace are currently in compliance with community integrity guidelines.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

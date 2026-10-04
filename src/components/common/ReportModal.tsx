import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { ReportItem } from '../../types';

interface ReportModalProps {
  targetType: 'listing' | 'request' | 'user' | 'message';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  onClose: () => void;
  onSubmit: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  reporterId,
  onClose,
  onSubmit
}) => {
  const [reason, setReason] = useState<ReportItem['reason']>('misleading');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    setIsSubmitting(true);
    onSubmit({
      targetType,
      targetId,
      reporterId,
      reason,
      details: details.trim()
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E4E7] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#18181B]">Report Content</h3>
            <p className="text-xs text-[#71717A] truncate max-w-[280px]">Target: {targetTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1.5">
              Reason for Reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportItem['reason'])}
              className="w-full text-xs p-2.5 bg-[#FAFAF8] border border-[#E4E4E7] rounded-lg text-[#18181B] focus:border-[#1E1B4B] focus:outline-hidden"
            >
              <option value="prohibited_item">Prohibited Item or Service</option>
              <option value="scam_fraud">Suspected Scam, Fraud or Stolen Property</option>
              <option value="misleading">Misleading Description or Inaccurate Price</option>
              <option value="inappropriate">Offensive or Inappropriate Content</option>
              <option value="spam">Spam or Duplicate Listing</option>
              <option value="other">Other Violation of Community Guidelines</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18181B] mb-1.5">
              Specific Details
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain the specific issue with clear evidence..."
              className="w-full text-xs p-3 bg-[#FAFAF8] border border-[#E4E4E7] rounded-lg text-[#18181B] focus:border-[#1E1B4B] focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !details.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              Submit Report for Review
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

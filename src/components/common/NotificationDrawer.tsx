import React, { useMemo } from 'react';
import {
  X,
  Bell,
  MessageSquare,
  Tag,
  Store,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { AppNotification, Conversation, RequestOffer, BuyerRequest } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  offers: RequestOffer[];
  requests: BuyerRequest[];
  userId: string;
  onNavigate: (view: 'home' | 'seller' | 'buyer' | 'request-orbit' | 'messages' | 'store', targetId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  offers,
  requests,
  userId,
  onNavigate
}) => {
  // Generate real, dynamic notifications from actual Firestore records
  const realNotifications = useMemo(() => {
    const list: AppNotification[] = [];

    // 1. Unread & recent conversations
    conversations.forEach((c) => {
      const unread = c.unreadCount?.[userId] || 0;
      const otherId = c.participantIds.find(id => id !== userId);
      const otherName = otherId ? (c.participantNames?.[otherId] || 'User') : 'Member';

      if (unread > 0 || c.lastMessageText) {
        list.push({
          id: `msg_${c.id}`,
          userId,
          type: 'message',
          title: unread > 0 ? `${unread} new message(s) from ${otherName}` : `Conversation with ${otherName}`,
          message: c.lastMessageText || 'Direct messaging discussion.',
          targetView: 'messages',
          targetId: c.id,
          read: unread === 0,
          createdAt: c.lastMessageAt || new Date().toISOString()
        });
      }
    });

    // 2. Received offers on user's buyer requests
    const userRequestIds = new Set(requests.filter(r => r.buyerId === userId).map(r => r.id));
    offers.forEach((o) => {
      if (userRequestIds.has(o.requestId)) {
        list.push({
          id: `offer_${o.id}`,
          userId,
          type: 'offer',
          title: `Proposal received from ${o.sellerName}`,
          message: `Offered $${o.proposedPrice} ${o.currency} for your buyer request.`,
          targetView: 'buyer',
          targetId: o.id,
          read: o.status !== 'pending',
          createdAt: o.createdAt
        });
      }
      // If user is seller and offer was accepted/declined
      if (o.sellerId === userId && o.status !== 'pending') {
        list.push({
          id: `offer_res_${o.id}`,
          userId,
          type: 'offer',
          title: `Proposal ${o.status}: $${o.proposedPrice}`,
          message: `Buyer has ${o.status} your proposal for their request.`,
          targetView: 'seller',
          targetId: o.id,
          read: true,
          createdAt: o.createdAt
        });
      }
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [conversations, offers, requests, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E2DFD8] novora-animate-drawer">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2DFD8] flex items-center justify-between bg-[#F7F5F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F7F3EB] text-[#C5A572] border border-[#E8DAC2] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#14243A]">Notification Center</h3>
                <p className="text-[11px] text-[#5A6578]">
                  {realNotifications.filter(n => !n.read).length} unread updates
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#5A6578] hover:text-[#14243A] hover:bg-[#EFECE4] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {realNotifications.length > 0 ? (
              realNotifications.map((notif) => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'message':
                      return <MessageSquare className="w-4 h-4 text-[#C5A572]" />;
                    case 'offer':
                      return <Tag className="w-4 h-4 text-emerald-600" />;
                    case 'store':
                      return <Store className="w-4 h-4 text-[#8E6D38]" />;
                    default:
                      return <Bell className="w-4 h-4 text-[#5A6578]" />;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onClose();
                      if (notif.targetView) {
                        onNavigate(notif.targetView, notif.targetId);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 hover:border-[#14243A] ${
                      !notif.read ? 'bg-[#F7F3EB]/70 border-[#E8DAC2]' : 'bg-white border-[#E2DFD8]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2DFD8] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[#14243A] truncate">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#C5A572] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#5A6578] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#8A94A6] pt-1">
                        <span>{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[#8E6D38] font-medium flex items-center gap-0.5 hover:text-[#14243A]">
                          <span>View</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F3EB] text-[#C5A572] border border-[#E8DAC2] flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#14243A]">All Caught Up</h4>
                <p className="text-xs text-[#5A6578] max-w-xs mx-auto leading-relaxed">
                  When you receive messages, quote proposals, or platform updates, they will appear here in real time.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E2DFD8] bg-[#F7F5F0] text-center">
            <span className="text-[11px] text-[#8A94A6]">
              NOVORA Real-Time Notification Stream
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ShieldAlert,
  Check,
  CheckCheck,
  User,
  Shield,
  MessageSquare,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Conversation, Message, UserProfile } from '../../types';
import { subscribeToMessages, sendDirectMessage } from '../../services/firebase';

interface MessagingModalProps {
  currentUser: UserProfile | null;
  activeConversation: Conversation | null;
  conversations: Conversation[];
  onSelectConversation: (conv: Conversation) => void;
  onClose: () => void;
  onReportMessage: (msgId: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  currentUser,
  activeConversation,
  conversations,
  onSelectConversation,
  onClose,
  onReportMessage,
  onOpenAuth
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  
  // Mobile navigation state: tracks whether mobile view is inspecting the thread or the conversation list
  const [isMobileThreadView, setIsMobileThreadView] = useState<boolean>(!!activeConversation);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // When activeConversation changes, update mobile thread view
  useEffect(() => {
    if (activeConversation) {
      setIsMobileThreadView(true);
    }
  }, [activeConversation]);

  // Subscribe to real-time messages for the active conversation
  useEffect(() => {
    if (activeConversation && currentUser) {
      const unsub = subscribeToMessages(activeConversation.id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    } else {
      setMessages([]);
    }
  }, [activeConversation, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#17191F]">
            Sign in to View Conversations
          </h3>
          <p className="text-xs text-[#646B76] leading-relaxed">
            Direct buyer-seller messaging requires authentication to protect community privacy and track inquiries.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth('signin');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-[#17191F] hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation || isSending) return;

    const now = Date.now();
    if (now - lastSentTime < 1000) {
      setRateLimitNotice('Please wait a moment before sending another message.');
      setTimeout(() => setRateLimitNotice(null), 3000);
      return;
    }

    setIsSending(true);
    try {
      await sendDirectMessage(activeConversation.id, text.trim());
      setText('');
      setLastSentTime(now);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setRateLimitNotice(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const otherParticipantId = activeConversation?.participantIds.find((id) => id !== currentUser.id);
  const otherParticipantName = otherParticipantId
    ? activeConversation?.participantNames[otherParticipantId] || 'Member'
    : 'User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[92vh] sm:h-[85vh] border border-[#E5E7EB] shadow-2xl flex overflow-hidden relative">
        
        {/* ================================================================= */}
        {/* Left Column: Conversations List                                   */}
        {/* On mobile: Hidden if isMobileThreadView is true                   */}
        {/* ================================================================= */}
        <div
          className={`${
            isMobileThreadView ? 'hidden md:flex' : 'flex'
          } w-full md:w-72 lg:w-80 border-r border-[#E5E7EB] flex-col bg-[#FAFAF8] shrink-0 h-full`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#17191F]">Conversations</h3>
              <span className="text-[11px] text-[#646B76] font-mono px-1.5 py-0.5 bg-white rounded-md border border-[#E5E7EB]">
                {conversations.length}
              </span>
            </div>
            {/* Close button visible when in list view on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 text-[#646B76] hover:text-[#17191F] rounded-lg cursor-pointer"
              aria-label="Close messaging"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#E5E7EB]">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const otherId = conv.participantIds.find((id) => id !== currentUser.id);
                const name = otherId ? conv.participantNames[otherId] || 'User' : 'User';
                const unreadCount = conv.unreadCount?.[currentUser.id] || 0;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      onSelectConversation(conv);
                      setIsMobileThreadView(true);
                    }}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected ? 'bg-white border-l-4 border-l-[#4057D6]' : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#17191F] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#17191F] truncate">{name}</span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-[#9CA3AF] shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#646B76] truncate mt-0.5">
                        {conv.lastMessageText || 'Direct inquiry thread'}
                      </p>
                      {conv.context?.listingTitle && (
                        <span className="text-[10px] text-[#4057D6] font-medium truncate block mt-0.5">
                          Ref: {conv.context.listingTitle}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#4057D6] mt-2 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <p className="text-xs font-medium text-[#17191F]">No active conversations</p>
                <p className="text-[11px] text-[#646B76]">
                  Inquire on any marketplace listing or submit proposals on Request Orbit to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Right Column: Active Conversation Messages & Composer             */}
        {/* On mobile: Hidden if isMobileThreadView is false                  */}
        {/* ================================================================= */}
        <div
          className={`${
            !isMobileThreadView ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col h-full bg-white min-w-0`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 sm:p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    type="button"
                    onClick={() => setIsMobileThreadView(false)}
                    className="md:hidden p-1.5 -ml-1 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-[#17191F] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {otherParticipantName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#17191F] truncate">
                      {otherParticipantName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#646B76]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">
                        {activeConversation.context?.listingTitle
                          ? `Item: ${activeConversation.context.listingTitle}`
                          : 'Direct Channel'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-[11px] text-[#1E3A8A] shrink-0">
                <Shield className="w-3.5 h-3.5 text-[#4057D6] shrink-0" />
                <span className="truncate">
                  Direct communication: Do not share sensitive payment credentials. Agree on terms independently.
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed break-words ${
                          isMine
                            ? 'bg-[#17191F] text-white rounded-br-xs'
                            : 'bg-[#F3F4F6] text-[#17191F] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF] mt-1 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-[#4057D6]" />}
                        {!isMine && (
                          <button
                            type="button"
                            onClick={() => onReportMessage(msg.id)}
                            className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Rate limit warning */}
              {rateLimitNotice && (
                <div className="px-4 py-1.5 bg-rose-50 text-rose-700 text-xs border-t border-rose-100 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{rateLimitNotice}</span>
                </div>
              )}

              {/* Composer */}
              <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-[#E5E7EB] bg-white flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#17191F] focus:border-[#4057D6] focus:bg-white focus:outline-hidden"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || isSending}
                  className="p-2.5 sm:p-3 rounded-xl bg-[#17191F] hover:bg-[#27272A] text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#FAFAF8]">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4057D6] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#17191F]">Select a Conversation</h3>
              <p className="text-xs text-[#646B76] max-w-xs leading-relaxed">
                Choose a conversation from the left to read messages and negotiate with sellers.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

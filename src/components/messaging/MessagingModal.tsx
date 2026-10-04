import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, Check, CheckCheck, User, Shield, MessageSquare, Loader2 } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#646B76] hover:text-[#17191F] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
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

    // Rate limit: at least 1 second between messages to prevent accidental double-posting
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

  const otherParticipantId = activeConversation?.participantIds.find(id => id !== currentUser.id);
  const otherParticipantName = otherParticipantId
    ? activeConversation?.participantNames[otherParticipantId] || 'Member'
    : 'User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] border border-[#E5E7EB] shadow-2xl flex overflow-hidden relative">
        
        {/* Left: Conversation List (300px) */}
        <div className="w-76 border-r border-[#E5E7EB] flex flex-col bg-[#FAFAF8]">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#17191F]">Conversations</h3>
            <span className="text-[11px] text-[#646B76] font-mono">{conversations.length}</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#E5E7EB]">
            {conversations.length > 0 ? (
              conversations.map(conv => {
                const isSelected = activeConversation?.id === conv.id;
                const otherId = conv.participantIds.find(id => id !== currentUser.id);
                const name = otherId ? conv.participantNames[otherId] || 'User' : 'User';

                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                      isSelected ? 'bg-white font-medium border-l-4 border-l-[#17191F]' : 'hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#17191F] truncate">{name}</span>
                      <span className="text-[10px] text-[#9CA3AF]">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>

                    {(conv.listingTitle || conv.requestTitle) && (
                      <span className="text-[11px] text-[#4057D6] truncate">
                        {conv.listingTitle || conv.requestTitle}
                      </span>
                    )}

                    <p className="text-xs text-[#646B76] truncate line-clamp-1">
                      {conv.lastMessageText}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#646B76] space-y-2">
                <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-[#9CA3AF]">Tap "Contact Seller" on any listing to start a thread.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="px-6 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-[#FAFAF8]">
                <div>
                  <h4 className="text-sm font-semibold text-[#17191F]">{otherParticipantName}</h4>
                  <p className="text-[11px] text-[#646B76]">
                    {activeConversation.listingTitle
                      ? `Listing: ${activeConversation.listingTitle}`
                      : activeConversation.requestTitle
                      ? `Request: ${activeConversation.requestTitle}`
                      : 'Direct Inquiry'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="p-1.5 text-[#646B76] hover:text-[#17191F] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="px-6 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-[11px] text-[#1E40AF]">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#4057D6]" />
                  Keep payments and communication secure. Never share raw credentials.
                </span>
                <span className="text-[10px] text-[#646B76]">Real-Time Persistent Chat</span>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#646B76] space-y-2">
                    <p>No messages in this conversation yet.</p>
                    <p className="text-[11px] text-[#9CA3AF]">Send a message below to begin.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[11px] font-medium text-[#17191F]">
                            {isMine ? 'You' : msg.senderName}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-[#17191F] text-white rounded-br-xs'
                              : 'bg-[#F3F4F6] text-[#17191F] rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAF8]">
                {rateLimitNotice && (
                  <p className="text-[11px] text-amber-600 mb-2">{rateLimitNotice}</p>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Message ${otherParticipantName}...`}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#17191F] focus:border-[#4057D6] focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || isSending}
                    className="p-2.5 bg-[#17191F] hover:bg-[#27272A] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#646B76] space-y-3">
              <MessageSquare className="w-10 h-10 text-[#9CA3AF]" />
              <p className="text-sm font-medium text-[#17191F]">Select a conversation to start messaging</p>
              <p className="text-xs text-[#9CA3AF] max-w-xs">
                Your direct messages are securely isolated to you and the participating seller or buyer.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

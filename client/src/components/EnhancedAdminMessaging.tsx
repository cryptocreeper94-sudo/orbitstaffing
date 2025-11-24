/**
 * Enhanced Admin/Dev/Owner Messaging System
 * Multi-recipient messaging with official/unofficial message types
 * Official = persistent in database
 * Unofficial = auto-delete after 30 days
 */
import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, X, ChevronDown, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Message {
  id: string;
  fromUserId: string;
  fromName: string;
  subject?: string;
  message: string;
  isOfficial: boolean;
  recipientUserIds: string[];
  readStatus?: Record<string, string>;
  createdAt: string;
  expiresAt?: string;
}

interface EnhancedAdminMessagingProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'admin' | 'dev' | 'owner';
}

export default function EnhancedAdminMessaging({
  currentUserId,
  currentUserName,
  currentUserRole,
}: EnhancedAdminMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());

  // Available users to message
  const availableUsers = [
    { id: 'sidonie-admin-001', name: 'Sidonie (Admin)', role: 'admin' },
    { id: 'dev-master-001', name: 'Dev Master', role: 'dev' },
    { id: 'owner-test-001', name: 'Owner', role: 'owner' },
  ].filter((u) => u.id !== currentUserId);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleToggleRecipient = (userId: string) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedRecipients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecipients.size === availableUsers.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(availableUsers.map((u) => u.id)));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || selectedRecipients.size === 0) {
      alert('Please write a message and select at least one recipient');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUserId,
          recipientUserIds: Array.from(selectedRecipients),
          subject: subject || 'Message',
          message: newMessage,
          isOfficial,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setSubject('');
        setSelectedRecipients(new Set());
        setIsOfficial(false);
        setShowCompose(false);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string, isOfficial: boolean) => {
    if (!isOfficial || !window.confirm('Delete this message permanently?')) return;

    try {
      const res = await fetch(`/api/messages/${messageId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletingUserId: currentUserId }),
      });

      if (res.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const isMessageRead = (message: Message) => {
    return message.readStatus?.[currentUserId] !== undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          Secure Messaging
        </h3>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-compose-message"
        >
          {showCompose ? 'Close' : 'New Message'}
        </Button>
      </div>

      {showCompose && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="input-msg-subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Recipients:</label>
              <div className="space-y-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-600">
                  <Checkbox
                    checked={selectedRecipients.size === availableUsers.length}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <span className="text-sm font-bold text-cyan-300">Select All</span>
                </div>

                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRecipients.has(user.id)}
                      onCheckedChange={() => handleToggleRecipient(user.id)}
                      data-testid={`checkbox-recipient-${user.id}`}
                    />
                    <span className="text-sm text-gray-300">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isOfficial}
                    onChange={() => setIsOfficial(false)}
                    className="w-4 h-4"
                    data-testid="radio-unofficial"
                  />
                  <span className="text-sm text-gray-300">
                    Unofficial <span className="text-xs text-gray-500">(auto-delete in 30 days)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isOfficial}
                    onChange={() => setIsOfficial(true)}
                    className="w-4 h-4"
                    data-testid="radio-official"
                  />
                  <span className="text-sm text-gray-300">
                    Official <span className="text-xs text-green-400">(persistent)</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message:</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                data-testid="textarea-message"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
              Send to {selectedRecipients.size} {selectedRecipients.size === 1 ? 'Person' : 'People'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No messages</p>
        ) : (
          messages.map((msg) => {
            const isRead = isMessageRead(msg);
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isRead
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/20'
                }`}
                onClick={() => {
                  setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                  if (!isRead) handleMarkAsRead(msg.id);
                }}
                data-testid={`message-item-${msg.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{msg.fromName}</p>
                      {msg.isOfficial ? (
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{msg.subject}</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                      expandedMessage === msg.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedMessage === msg.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                        {!msg.isOfficial && msg.expiresAt && (
                          <span className="ml-2 text-yellow-400">
                            Expires: {new Date(msg.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      {msg.isOfficial && msg.fromUserId === currentUserId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg.id, msg.isOfficial);
                          }}
                          className="p-1 hover:bg-red-900/30 rounded text-red-400"
                          data-testid={`button-delete-message-${msg.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

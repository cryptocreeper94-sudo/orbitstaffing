/**
 * Admin/Dev/Owner Messaging System
 * Links all admin, dev, and owner accounts for customer service
 */
import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagingProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'admin' | 'dev' | 'owner';
}

export default function AdminMessaging({ currentUserId, currentUserName, currentUserRole }: MessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Available recipients based on role
  const recipients = [
    { id: 'sidonie-admin-001', name: 'Sidonie (Admin)' },
    { id: 'dev-master-001', name: 'Dev Master' },
    { id: 'owner-test-001', name: 'Owner' },
  ].filter((r) => r.id !== currentUserId);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !toUserId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUserId,
          toUserId,
          subject: subject || 'Message',
          message: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setSubject('');
        setToUserId('');
        setShowCompose(false);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, { method: 'POST' });
      loadMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          Messages
        </h3>
        <Button onClick={() => setShowCompose(!showCompose)} className="bg-cyan-600 hover:bg-cyan-700">
          {showCompose ? 'Cancel' : 'New Message'}
        </Button>
      </div>

      {showCompose && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To:</label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="select-message-recipient"
              >
                <option value="">Select recipient...</option>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="input-message-subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message:</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                data-testid="textarea-message-content"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                msg.isRead
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/20'
              }`}
              onClick={() => {
                setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                if (!msg.isRead) handleMarkAsRead(msg.id);
              }}
              data-testid={`message-item-${msg.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{msg.fromName}</p>
                  <p className="text-xs text-gray-400">{msg.subject || 'No subject'}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedMessage === msg.id ? 'transform rotate-180' : ''
                  }`}
                />
              </div>

              {expandedMessage === msg.id && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

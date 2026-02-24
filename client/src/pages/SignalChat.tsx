import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Hash, ChevronDown, ChevronRight, MessageSquare, Users, LogOut, AlertCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarColor: string;
  role: string;
  trustLayerId?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isDefault: boolean | null;
}

interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username?: string;
  avatarColor?: string;
  role?: string;
  content: string;
  replyToId: string | null;
  createdAt: string;
}

interface TypingUser {
  userId: string;
  username: string;
  timeout: ReturnType<typeof setTimeout>;
}

const STORAGE_TOKEN_KEY = 'signal_chat_token';
const STORAGE_USER_KEY = 'signal_chat_user';
const MAX_CHAR_LIMIT = 2000;

function getStoredAuth(): { token: string | null; user: ChatUser | null } {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const userStr = localStorage.getItem(STORAGE_USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function storeAuth(token: string, user: ChatUser) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

function AuthScreen({ onAuth }: { onAuth: (token: string, user: ChatUser) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      storeAuth(data.token, data.user);
      onAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          displayName: regDisplayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      storeAuth(data.token, data.user);
      onAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Signal Chat</h1>
          <p className="text-slate-400 text-sm">DarkWave Ecosystem Communication</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'register'); setError(''); }}>
            <TabsList className="w-full bg-slate-800/50 mb-6">
              <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white" data-testid="tab-login">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white" data-testid="tab-register">
                Register
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3" data-testid="text-auth-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Username</label>
                  <Input
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="your_username"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-login-username"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Password</label>
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-login-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" disabled={loading} data-testid="button-login-submit">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Username</label>
                  <Input
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="choose_a_username"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-register-username"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-register-email"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Display Name</label>
                  <Input
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-register-displayname"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Password</label>
                  <Input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="8+ chars, 1 capital, 1 special"
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500"
                    data-testid="input-register-password"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Min 8 characters, 1 uppercase, 1 special character</p>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" disabled={loading} data-testid="button-register-submit">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ChannelSidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  user,
  onLogout,
  onlineCount,
  isOpen,
  onClose,
}: {
  channels: ChatChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  user: ChatUser;
  onLogout: () => void;
  onlineCount: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const grouped = channels.reduce<Record<string, ChatChannel[]>>((acc, ch) => {
    const cat = ch.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categoryLabels: Record<string, string> = {
    ecosystem: 'Ecosystem',
    'app-support': 'App Support',
    other: 'Other',
  };

  return (
    <div className={`
      fixed md:relative inset-y-0 left-0 z-40 w-64 flex flex-col
      bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
      transform transition-transform duration-200
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Signal Chat</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white" data-testid="button-close-sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span data-testid="text-online-count">{onlineCount} online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(grouped).map(([category, chans]) => (
          <div key={category} className="mb-1">
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-1 px-4 py-1.5 w-full text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300"
              data-testid={`button-category-${category}`}
            >
              {collapsed[category] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{categoryLabels[category] || category}</span>
            </button>
            {!collapsed[category] && chans.map((ch) => (
              <button
                key={ch.id}
                onClick={() => { onSelectChannel(ch.id); onClose(); }}
                className={`flex items-center gap-2 px-4 py-1.5 w-full text-left text-sm transition-colors ${
                  activeChannelId === ch.id
                    ? 'text-cyan-400 bg-cyan-500/10 border-r-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                data-testid={`button-channel-${ch.name}`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: user.avatarColor }}
            data-testid="avatar-current-user"
          >
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate" data-testid="text-current-username">{user.displayName}</p>
            <p className="text-slate-500 text-xs truncate">@{user.username}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-400 hover:text-red-400 shrink-0" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  currentUserId,
  onReply,
  messages,
}: {
  msg: ChatMessage;
  currentUserId: string;
  onReply: (id: string) => void;
  messages: ChatMessage[];
}) {
  const isOwn = msg.userId === currentUserId;
  const initial = (msg.username || '?').charAt(0).toUpperCase();
  const replyTarget = msg.replyToId ? messages.find((m) => m.id === msg.replyToId) : null;

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`} data-testid={`message-${msg.id}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: msg.avatarColor || '#06b6d4' }}
      >
        {initial}
      </div>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-slate-300">{msg.username || 'Unknown'}</span>
          <span className="text-[10px] text-slate-600">{formatTime(msg.createdAt)}</span>
        </div>

        {replyTarget && (
          <div className="text-xs text-slate-500 border-l-2 border-cyan-500/40 pl-2 mb-1 truncate max-w-[200px]">
            Replying to {replyTarget.username}: {replyTarget.content?.slice(0, 60)}
          </div>
        )}

        <div
          className={`rounded-xl px-3 py-2 text-sm leading-relaxed break-words ${
            isOwn
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
              : 'bg-slate-800/80 text-slate-200 border border-slate-700/40 rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>

        <button
          onClick={() => onReply(msg.id)}
          className="text-[10px] text-slate-600 hover:text-cyan-400 mt-0.5 invisible group-hover:visible transition-colors"
          data-testid={`button-reply-${msg.id}`}
        >
          Reply
        </button>
      </div>
    </div>
  );
}

function ChatArea({
  messages,
  currentUser,
  channelName,
  typingUsers,
  onSend,
  onTyping,
  onToggleSidebar,
}: {
  messages: ChatMessage[];
  currentUser: ChatUser;
  channelName: string;
  typingUsers: TypingUser[];
  onSend: (content: string, replyToId?: string) => void;
  onTyping: () => void;
  onToggleSidebar: () => void;
}) {
  const [input, setInput] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    if (messages.length !== prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessageCount.current = messages.length;
    }
  }, [messages.length]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MAX_CHAR_LIMIT) return;
    onSend(trimmed, replyToId || undefined);
    setInput('');
    setReplyToId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    onTyping();
  };

  const replyTarget = replyToId ? messages.find((m) => m.id === replyToId) : null;
  const filteredTyping = typingUsers.filter((t) => t.userId !== currentUser.id);

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <button onClick={onToggleSidebar} className="md:hidden text-slate-400 hover:text-white" data-testid="button-toggle-sidebar">
          <Menu className="w-5 h-5" />
        </button>
        <Hash className="w-4 h-4 text-cyan-400" />
        <span className="text-white font-semibold text-sm" data-testid="text-channel-name">{channelName}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            currentUserId={currentUser.id}
            onReply={(id) => setReplyToId(id)}
            messages={messages}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {filteredTyping.length > 0 && (
        <div className="px-4 py-1 text-xs text-cyan-400/70 animate-pulse" data-testid="text-typing-indicator">
          {filteredTyping.map((t) => t.username).join(', ')} {filteredTyping.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <div className="p-3 border-t border-slate-700/50 bg-slate-900/30">
        {replyTarget && (
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2">
            <span className="truncate">Replying to <span className="text-cyan-400">{replyTarget.username}</span>: {replyTarget.content?.slice(0, 80)}</span>
            <button onClick={() => setReplyToId(null)} className="text-slate-500 hover:text-white ml-2 shrink-0" data-testid="button-cancel-reply">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none bg-slate-800/50 border-slate-600/40 text-white placeholder:text-slate-500 text-sm min-h-[40px] max-h-[120px]"
            rows={1}
            maxLength={MAX_CHAR_LIMIT}
            data-testid="input-message"
          />
          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-30"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] ${input.length > MAX_CHAR_LIMIT * 0.9 ? 'text-amber-400' : 'text-slate-600'}`}>
            {input.length}/{MAX_CHAR_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SignalChat() {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<ChatUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored.token && stored.user) {
      fetch('/api/chat/auth/me', {
        headers: { Authorization: `Bearer ${stored.token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setToken(stored.token);
            setAuthenticated(true);
          } else {
            clearAuth();
          }
        })
        .catch(() => clearAuth());
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch('/api/chat/channels')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChannels(data);
          const defaultCh = data.find((c: ChatChannel) => c.isDefault) || data[0];
          if (defaultCh && !activeChannelId) {
            setActiveChannelId(defaultCh.id);
          }
        }
      })
      .catch(() => {});
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !token || !activeChannelId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'switch_channel', channelId: activeChannelId }));
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', token, channelId: activeChannelId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'history':
            setMessages(data.messages || []);
            break;

          case 'message':
            setMessages((prev) => [...prev, data]);
            setTypingUsers((prev) => prev.filter((t) => t.userId !== data.userId));
            break;

          case 'typing':
            setTypingUsers((prev) => {
              const existing = prev.find((t) => t.userId === data.userId);
              if (existing) {
                clearTimeout(existing.timeout);
                existing.timeout = setTimeout(() => {
                  setTypingUsers((p) => p.filter((t) => t.userId !== data.userId));
                }, 3000);
                return [...prev];
              }
              const timeout = setTimeout(() => {
                setTypingUsers((p) => p.filter((t) => t.userId !== data.userId));
              }, 3000);
              return [...prev, { userId: data.userId, username: data.username, timeout }];
            });
            break;

          case 'user_joined':
            break;

          case 'user_left':
            setTypingUsers((prev) => prev.filter((t) => t.userId !== data.userId));
            break;

          case 'presence':
            setOnlineCount(data.onlineCount || 0);
            break;

          case 'error':
            toast({ title: 'Chat Error', description: data.message, variant: 'destructive' });
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [authenticated, token, activeChannelId]);

  const handleSwitchChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setMessages([]);
    setTypingUsers([]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'switch_channel', channelId }));
    }
  }, []);

  const handleSend = useCallback((content: string, replyToId?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content, replyToId: replyToId || null }));
    }
  }, []);

  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  }, []);

  const handleAuth = (t: string, u: ChatUser) => {
    setToken(t);
    setUser(u);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    clearAuth();
    if (wsRef.current) wsRef.current.close();
    wsRef.current = null;
    setAuthenticated(false);
    setUser(null);
    setToken(null);
    setMessages([]);
    setChannels([]);
    setActiveChannelId('');
  };

  if (!authenticated || !user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="h-screen flex bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <ChannelSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSwitchChannel}
        user={user}
        onLogout={handleLogout}
        onlineCount={onlineCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChatArea
        messages={messages}
        currentUser={user}
        channelName={activeChannel?.name || 'general'}
        typingUsers={typingUsers}
        onSend={handleSend}
        onTyping={handleTyping}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}

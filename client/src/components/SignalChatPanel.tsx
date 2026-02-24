import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Hash, ChevronDown, ChevronRight, MessageSquare, Users, LogOut, AlertCircle, X } from 'lucide-react';
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

function PanelAuth({ onAuth }: { onAuth: (token: string, user: ChatUser) => void }) {
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
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword, displayName: regDisplayName }),
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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-cyan-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-bold text-white">Signal Chat</h2>
          <p className="text-slate-500 text-xs">Ecosystem Communication</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'register'); setError(''); }}>
          <TabsList className="w-full bg-slate-800/50 mb-4 h-8">
            <TabsTrigger value="login" className="flex-1 text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white" data-testid="tab-chat-login">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1 text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white" data-testid="tab-chat-register">Register</TabsTrigger>
          </TabsList>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2" data-testid="text-chat-auth-error">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3">
              <Input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Username" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-login-username" required />
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-login-password" required />
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs h-9" disabled={loading} data-testid="button-chat-login">{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              <Input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="Username" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-reg-username" required />
              <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-reg-email" required />
              <Input value={regDisplayName} onChange={(e) => setRegDisplayName(e.target.value)} placeholder="Display Name" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-reg-displayname" required />
              <div>
                <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Password" className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 text-xs h-9" data-testid="input-chat-reg-password" required />
                <p className="text-[10px] text-slate-500 mt-1">8+ chars, 1 uppercase, 1 special</p>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs h-9" disabled={loading} data-testid="button-chat-register">{loading ? 'Creating...' : 'Create Account'}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MessageBubble({ msg, currentUserId, onReply, messages }: { msg: ChatMessage; currentUserId: string; onReply: (id: string) => void; messages: ChatMessage[] }) {
  const isOwn = msg.userId === currentUserId;
  const initial = (msg.username || '?').charAt(0).toUpperCase();
  const replyTarget = msg.replyToId ? messages.find((m) => m.id === msg.replyToId) : null;
  const formatTime = (ts: string) => { try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`} data-testid={`chat-msg-${msg.id}`}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: msg.avatarColor || '#06b6d4' }}>{initial}</div>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-baseline gap-1.5 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] font-semibold text-slate-300">{msg.username || 'Unknown'}</span>
          <span className="text-[9px] text-slate-600">{formatTime(msg.createdAt)}</span>
        </div>
        {replyTarget && (
          <div className="text-[10px] text-slate-500 border-l-2 border-cyan-500/40 pl-1.5 mb-0.5 truncate max-w-[180px]">
            {replyTarget.username}: {replyTarget.content?.slice(0, 40)}
          </div>
        )}
        <div className={`rounded-lg px-2.5 py-1.5 text-xs leading-relaxed break-words ${isOwn ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm' : 'bg-slate-800/80 text-slate-200 border border-slate-700/40 rounded-tl-sm'}`}>{msg.content}</div>
        <button onClick={() => onReply(msg.id)} className="text-[9px] text-slate-600 hover:text-cyan-400 mt-0.5 invisible group-hover:visible" data-testid={`btn-reply-${msg.id}`}>Reply</button>
      </div>
    </div>
  );
}

export default function SignalChatPanel() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<ChatUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showChannels, setShowChannels] = useState(false);

  const [input, setInput] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const lastTypingSentRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored.token && stored.user) {
      fetch('/api/chat/auth/me', { headers: { Authorization: `Bearer ${stored.token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setToken(stored.token);
            setAuthenticated(true);
          } else { clearAuth(); }
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
          if (defaultCh && !activeChannelId) setActiveChannelId(defaultCh.id);
        }
      })
      .catch(() => {});
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !token || !activeChannelId || !isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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
          case 'history': setMessages(data.messages || []); break;
          case 'message':
            setMessages((prev) => [...prev, data]);
            setTypingUsers((prev) => prev.filter((t) => t.userId !== data.userId));
            break;
          case 'typing':
            setTypingUsers((prev) => {
              const existing = prev.find((t) => t.userId === data.userId);
              if (existing) {
                clearTimeout(existing.timeout);
                existing.timeout = setTimeout(() => setTypingUsers((p) => p.filter((t) => t.userId !== data.userId)), 3000);
                return [...prev];
              }
              const timeout = setTimeout(() => setTypingUsers((p) => p.filter((t) => t.userId !== data.userId)), 3000);
              return [...prev, { userId: data.userId, username: data.username, timeout }];
            });
            break;
          case 'user_left': setTypingUsers((prev) => prev.filter((t) => t.userId !== data.userId)); break;
          case 'presence': setOnlineCount(data.onlineCount || 0); break;
          case 'error': toast({ title: 'Chat Error', description: data.message, variant: 'destructive' }); break;
        }
      } catch {}
    };

    ws.onclose = () => { wsRef.current = null; };

    return () => { ws.close(); wsRef.current = null; };
  }, [authenticated, token, activeChannelId, isOpen]);

  useEffect(() => {
    if (messages.length !== prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessageCount.current = messages.length;
    }
  }, [messages.length]);

  const handleSwitchChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setMessages([]);
    setTypingUsers([]);
    setShowChannels(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'switch_channel', channelId }));
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MAX_CHAR_LIMIT) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: trimmed, replyToId: replyToId || null }));
    }
    setInput('');
    setReplyToId(null);
  }, [input, replyToId]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const filteredTyping = typingUsers.filter((t) => t.userId !== user?.id);
  const replyTarget = replyToId ? messages.find((m) => m.id === replyToId) : null;

  const grouped = channels.reduce<Record<string, ChatChannel[]>>((acc, ch) => {
    const cat = ch.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const categoryLabels: Record<string, string> = { ecosystem: 'Ecosystem', 'app-support': 'App Support', other: 'Other' };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex items-center gap-1.5 py-3 px-1.5 rounded-l-lg transition-all duration-300 ${
          isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        } bg-gradient-to-b from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:px-2`}
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
        data-testid="tab-signal-chat"
      >
        <MessageSquare className="w-3.5 h-3.5 text-white rotate-90" />
        <span className="text-white text-[11px] font-semibold tracking-wider">SIGNAL</span>
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/30 z-[65] md:bg-transparent md:pointer-events-none" onClick={() => setIsOpen(false)} />}

      <div
        className={`fixed right-0 top-0 bottom-0 z-[70] w-[340px] sm:w-[380px] flex flex-col bg-slate-950/98 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/50 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xs">Signal Chat</span>
              {authenticated && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Users className="w-2.5 h-2.5" />
                  <span>{onlineCount} online</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors" data-testid="button-close-chat">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!authenticated || !user ? (
          <PanelAuth onAuth={handleAuth} />
        ) : showChannels ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/30">
              <span className="text-xs font-semibold text-slate-300">Channels</span>
              <button onClick={() => setShowChannels(false)} className="text-xs text-cyan-400 hover:text-cyan-300" data-testid="button-back-to-chat">Back</button>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {Object.entries(grouped).map(([category, chans]) => (
                <div key={category} className="mb-0.5">
                  <button onClick={() => setCollapsedCats((p) => ({ ...p, [category]: !p[category] }))} className="flex items-center gap-1 px-3 py-1.5 w-full text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300" data-testid={`btn-cat-${category}`}>
                    {collapsedCats[category] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{categoryLabels[category] || category}</span>
                    <span className="text-slate-600 ml-auto">{chans.length}</span>
                  </button>
                  {!collapsedCats[category] && chans.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSwitchChannel(ch.id)}
                      className={`flex items-center gap-2 px-4 py-1.5 w-full text-left text-xs transition-colors ${
                        activeChannelId === ch.id ? 'text-cyan-400 bg-cyan-500/10 border-r-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                      data-testid={`btn-channel-${ch.name}`}
                    >
                      <Hash className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ch.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>{user.displayName.charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-[11px] font-medium truncate">{user.displayName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-6 w-6 text-slate-400 hover:text-red-400" data-testid="button-chat-logout"><LogOut className="w-3 h-3" /></Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30">
              <button onClick={() => setShowChannels(true)} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors" data-testid="button-show-channels">
                <Hash className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{activeChannel?.name || 'general'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>{user.displayName.charAt(0).toUpperCase()}</div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-5 w-5 text-slate-500 hover:text-red-400" data-testid="button-chat-logout-inline"><LogOut className="w-3 h-3" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-slate-500 text-xs">No messages yet</p>
                </div>
              )}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} currentUserId={user.id} onReply={(id) => setReplyToId(id)} messages={messages} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {filteredTyping.length > 0 && (
              <div className="px-3 py-1 text-[10px] text-cyan-400/70 animate-pulse" data-testid="text-chat-typing">
                {filteredTyping.map((t) => t.username).join(', ')} {filteredTyping.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <div className="p-2.5 border-t border-slate-700/50">
              {replyTarget && (
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 bg-slate-800/50 rounded-md px-2 py-1.5">
                  <span className="truncate">Replying to <span className="text-cyan-400">{replyTarget.username}</span></span>
                  <button onClick={() => setReplyToId(null)} className="text-slate-500 hover:text-white ml-1.5 shrink-0" data-testid="button-cancel-reply"><X className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex items-end gap-1.5">
                <Textarea
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 resize-none bg-slate-800/50 border-slate-600/40 text-white placeholder:text-slate-500 text-xs min-h-[36px] max-h-[80px] py-2"
                  rows={1}
                  maxLength={MAX_CHAR_LIMIT}
                  data-testid="input-chat-message"
                />
                <Button onClick={handleSend} size="icon" disabled={!input.trim()} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-30 h-9 w-9 shrink-0" data-testid="button-chat-send">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

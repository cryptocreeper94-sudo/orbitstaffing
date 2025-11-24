/**
 * Developer Panel
 * Full technical access to system APIs, configurations, and developer tools
 * Everything non-business-sensitive for developers and tech partners
 */
import React, { useState, useEffect, useRef } from 'react';
import { Code, Lock, LogOut, AlertCircle, CheckCircle2, Key, Database, Zap, Shield, Eye, Copy, BarChart3, MessageCircle, ExternalLink, AlertTriangle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { HallmarkWatermark, HallmarkBadge } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import EnhancedAdminMessaging from '@/components/EnhancedAdminMessaging';
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import HourCounter from '@/components/HourCounter';
import UniversalEmployeeRegistry from '@/components/UniversalEmployeeRegistry';

export default function DeveloperPanel() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('developerAuthenticated') === 'true';
    }
    return false;
  });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'apis' | 'examples' | 'messaging'>('overview');
  const [copied, setCopied] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: 'Hey! I\'m your AI assistant. What can I help you with?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('developerAuthenticated', 'true');
    }
  }, [isAuthenticated]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        localStorage.setItem('developerAuthenticated', 'true');
        setIsAuthenticated(true);
        setPin('');
      } else {
        setError('Invalid PIN.');
        setPin('');
      }
    } catch (err) {
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    }
  };

  const handleLogout = () => {
    setLocation('/');
    localStorage.removeItem('developerAuthenticated');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/developer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          role: 'user',
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', text: data.aiMessage }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble processing your message. Try again.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Code className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Developer Access</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your access code to access technical APIs and developer tools
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Please enter 7 digit access code</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="•••••••"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400"
                autoFocus
                data-testid="input-developer-pin"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold text-lg"
              data-testid="button-developer-login"
            >
              Access Developer Panel
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            For technical team members and API integrations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 rounded-xl shadow-2xl flex flex-col z-50 glow-cyan">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-cyan-100 hover:text-white text-xl"
              data-testid="button-close-chat"
            >
              ✕
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-700 text-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 rounded-lg rounded-bl-none px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-slate-700 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
                data-testid="input-chat-message"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-3 py-2 rounded text-white font-bold text-sm transition-opacity"
                data-testid="button-send-message"
              >
                {chatLoading ? '...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Chat with AI for field support</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Code className="w-8 h-8 text-purple-400" />
              Developer Panel
            </h1>
            <p className="text-gray-400">Technical APIs, integrations, and configuration</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              onClick={() => navigateTo('/incident-reporting')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 px-3 py-2 text-sm"
              data-testid="button-dev-incident-report"
            >
              <AlertTriangle className="w-4 h-4" />
              Incidents
            </Button>
            <Button
              onClick={() => navigateTo('/workers-comp-admin')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2 px-3 py-2 text-sm"
              data-testid="button-dev-workers-comp"
            >
              <Shield className="w-4 h-4" />
              Workers Comp
            </Button>
            <Button
              onClick={() => navigateTo('/admin')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-2 px-3 py-2 text-sm"
              data-testid="button-dev-to-admin"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              onClick={() => navigateTo('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 px-3 py-2 text-sm"
              data-testid="button-dev-to-app"
            >
              <BarChart3 className="w-4 h-4" />
              Main App
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 px-3 py-2 text-sm md:col-span-2"
              data-testid="button-developer-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-overview"
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'apis'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-apis"
          >
            API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'examples'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-examples"
          >
            Examples & Assets
          </button>
          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'messaging'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-messaging"
          >
            <MessageCircle className="w-4 h-4" />
            Secure Messaging
          </button>
          <div className="ml-auto flex items-center">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded transition-all text-sm flex items-center gap-2"
              data-testid="button-tab-ask-ai"
            >
              <MessageCircle className="w-4 h-4" />
              Ask AI
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WeatherNewsWidget userRole="dev" zipCode="37201" />
              </div>
              <div className="lg:col-span-2">
                <HourCounter userRole="dev" />
              </div>
            </div>

            {/* Universal Employee Registry */}
            <div className="mt-8">
              <UniversalEmployeeRegistry userRole="dev" />
            </div>
          </div>
        )}

        {/* OVERVIEW TAB - OLD CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-6 hidden">
            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Replit IDE Link */}
              <a 
                href="https://replit.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition-all flex items-start gap-4"
                data-testid="link-replit-ide"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Replit IDE
                  </h3>
                  <p className="text-purple-100 text-sm">Open the development environment</p>
                </div>
                <ExternalLink className="w-5 h-5 text-purple-200 flex-shrink-0 mt-1" />
              </a>

              {/* AI Agent Link */}
              <a 
                href="javascript:void(0)" 
                onClick={() => {
                  alert('AI Agent: Right-click on any page → "Ask AI" to open the chat interface. Or press the purple "Ask AI" button on the screen.');
                }}
                className="bg-gradient-to-br from-cyan-600 to-cyan-800 border border-cyan-500 rounded-lg p-6 hover:border-cyan-400 transition-all flex items-start gap-4 cursor-pointer"
                data-testid="link-ai-agent"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI Assistant
                  </h3>
                  <p className="text-cyan-100 text-sm">Chat for field support & debugging</p>
                </div>
                <ExternalLink className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-1" />
              </a>

              {/* App Link */}
              <a 
                href="/" 
                className="bg-gradient-to-br from-green-600 to-green-800 border border-green-500 rounded-lg p-6 hover:border-green-400 transition-all flex items-start gap-4"
                data-testid="link-main-app"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Main App
                  </h3>
                  <p className="text-green-100 text-sm">View the staffing platform</p>
                </div>
                <ExternalLink className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
              </a>
            </div>

            {/* Developer Access Info */}
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Developer Access
              </h2>
              <p className="text-gray-300 mb-4">
                This panel provides full access to technical APIs, integrations, and configuration. All endpoints are documented with examples and authentication details.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Full REST API documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  WebSocket endpoints for real-time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Database schema reference
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Authentication & rate limiting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Code examples (Node, Python, cURL)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Webhook configurations
                </li>
              </ul>
            </div>

            {/* Core Systems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Workers API */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Workers System
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ CRUD operations for workers</li>
                  <li>✓ Skills & availability management</li>
                  <li>✓ Background check tracking</li>
                  <li>✓ I-9 verification status</li>
                  <li>✓ Digital Hallmark generation</li>
                  <li>✓ Avatar/photo uploads</li>
                </ul>
              </div>

              {/* Collections & Payments */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-400" />
                  Collections & Payments
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Payment method management</li>
                  <li>✓ Dunning sequence automation</li>
                  <li>✓ Collection status tracking</li>
                  <li>✓ Service suspension/restoration</li>
                  <li>✓ Overdue amount calculations</li>
                  <li>✓ Payment arrangement tracking</li>
                </ul>
              </div>

              {/* Database Access */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Database
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ PostgreSQL via Neon</li>
                  <li>✓ Drizzle ORM integration</li>
                  <li>✓ Real-time backups enabled</li>
                  <li>✓ Full transaction support</li>
                  <li>✓ Schema versioning</li>
                  <li>✓ Query optimization tools</li>
                </ul>
              </div>

              {/* Security & Auth */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Security
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Session-based auth</li>
                  <li>✓ Role-based access control</li>
                  <li>✓ PIN-based admin login</li>
                  <li>✓ Data isolation per tenant</li>
                  <li>✓ Encryption for sensitive data</li>
                  <li>✓ Audit trail logging</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* APIs TAB */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            {/* Payment Methods APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Payment Methods API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/payment-methods/:methodId/set-primary</div>
                </div>
              </div>
            </div>

            {/* Collections APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Collections & Dunning API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/overdue-amount</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/collections/:collectionId</div>
                </div>
              </div>
            </div>

            {/* Service Suspension APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Service Management API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-red-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/suspend-services</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/unsuspend-services</div>
                </div>
              </div>
            </div>

            {/* Example Request */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Example Request</h3>
              <div className="bg-slate-900 rounded p-4 font-mono text-xs text-gray-300 overflow-x-auto mb-4">
{`curl -X POST http://localhost:5000/api/companies/comp-123/collections \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "dueDate": "2025-12-01",
    "status": "overdue",
    "severity": "warning"
  }'`}
              </div>
              <Button
                onClick={() => copyToClipboard('curl example', 'api-example')}
                className="bg-purple-600 hover:bg-purple-700 text-xs"
              >
                {copied === 'api-example' ? '✓ Copied' : 'Copy Example'}
              </Button>
            </div>
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div className="space-y-8">
            {/* Digital Employee Card Example */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Digital Employee Card with Hallmark
              </h3>
              <div className="flex justify-center mb-6">
                <DigitalEmployeeCard
                  workerId="WRK-2024-45892"
                  employeeNumber="EMP-0892"
                  fullName="John Michael Rodriguez"
                  company="Superior Staffing"
                  status="active"
                  role="Electrician & HVAC"
                  skills={['Electrician', 'HVAC', 'General Labor']}
                  joinDate="Mar 15, 2024"
                  phone="+1 (615) 555-0892"
                  email="john@superior-staffing.com"
                  verificationCode="ORBIT-XK9M2Q7W8P"
                  avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                />
              </div>
              <p className="text-sm text-gray-400 text-center">Click to flip the card and see back side with verification code</p>
            </div>

            {/* Hallmark Examples */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Hallmark Watermark Sizes & Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Small */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="small" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Small</p>
                  <p className="text-xs text-gray-400 text-center">Emails, badges, inline notifications</p>
                </div>

                {/* Medium */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="medium" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Medium</p>
                  <p className="text-xs text-gray-400 text-center">Credentials, certificates, cards</p>
                </div>

                {/* Large */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="large" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Large</p>
                  <p className="text-xs text-gray-400 text-center">Document watermarks, backgrounds</p>
                </div>
              </div>
            </div>

            {/* Assets Available */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Available Assets & Deliverables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Digital Employee Card</p>
                    <p className="text-xs text-gray-500">Worker ID with photo, employee number, skills, status</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Hallmark Watermark</p>
                    <p className="text-xs text-gray-500">3 sizes: small, medium, large with adjustable opacity</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">QR Code Integration</p>
                    <p className="text-xs text-gray-500">Every credential links to live verification database</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Invoice Watermarking</p>
                    <p className="text-xs text-gray-500">Automatic Hallmark stamping on all official documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Email Headers</p>
                    <p className="text-xs text-gray-500">Hallmark badge in system communications</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">White-Label Assets</p>
                    <p className="text-xs text-gray-500">Customizable for franchise partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGING TAB */}
        {activeTab === 'messaging' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <EnhancedAdminMessaging
              currentUserId="dev-master-001"
              currentUserName="Dev Master"
              currentUserRole="dev"
            />
          </div>
        )}
      </div>
    </div>
  );
}

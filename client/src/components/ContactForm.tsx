/**
 * Developer Contact Form
 * Accessible on all pages with spam filtering and category selection
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MessageCategory = 'IT worker' | 'developer' | 'owner' | 'investor' | 'general';

export function ContactForm({ open, onOpenChange }: ContactFormProps) {
  const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<MessageCategory | null>(null);
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: '',
    message: '',
  });

  const categories: { value: MessageCategory; label: string; description: string }[] = [
    { value: 'IT worker', label: '👷 IT Worker', description: 'Technical inquiries and support' },
    { value: 'developer', label: '💻 Developer', description: 'Integration and API questions' },
    { value: 'owner', label: '👔 Business Owner', description: 'General inquiries' },
    { value: 'investor', label: '💰 Investor', description: 'Partnership and investment' },
    { value: 'general', label: '📧 General', description: 'Other inquiries' },
  ];

  const handleCategorySelect = (selected: MessageCategory) => {
    setCategory(selected);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic spam filter checks
      const spamPatterns = ['viagra', 'casino', 'lottery', 'click here', '$$$$'];
      const messageText = (formData.message + formData.subject).toLowerCase();
      const isSpam = spamPatterns.some(pattern => messageText.includes(pattern));

      if (isSpam) {
        toast.error('Message detected as spam. Please try again.');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.senderEmail)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Char limit check
      if (formData.message.length < 10) {
        toast.error('Message must be at least 10 characters');
        setLoading(false);
        return;
      }

      if (formData.message.length > 2000) {
        toast.error('Message must be under 2000 characters');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/developer/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category,
          userAgent: navigator.userAgent,
          ipAddress: 'client-side',
        }),
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          onOpenChange(false);
          setStep('category');
          setCategory(null);
          setFormData({ senderName: '', senderEmail: '', senderPhone: '', subject: '', message: '' });
        }, 2000);
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Error sending message');
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-border/50">
        {/* Category Selection */}
        {step === 'category' && (
          <div className="space-y-4 py-4">
            <DialogHeader>
              <DialogTitle>How can we help?</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className="w-full p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                  data-testid={`button-category-${cat.value}`}
                >
                  <div className="font-medium text-foreground">{cat.label}</div>
                  <div className="text-xs text-muted-foreground">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <div className="space-y-4 py-4">
            <DialogHeader>
              <DialogTitle>Contact Developer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <Input
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="Your name"
                  required
                  data-testid="input-contact-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  placeholder="you@example.com"
                  required
                  data-testid="input-contact-email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone (Optional)</label>
                <Input
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  placeholder="+1 (615) 555-0123"
                  data-testid="input-contact-phone"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Message subject"
                  required
                  data-testid="input-contact-subject"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your message (10-2000 characters)"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border/30 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  data-testid="textarea-contact-message"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.message.length}/2000
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('category');
                    setCategory(null);
                  }}
                  data-testid="button-back-category"
                >
                  Back
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground">Message Sent!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you for reaching out. We'll respond soon.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

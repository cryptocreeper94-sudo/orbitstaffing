# SMTP Email Configuration for Production

## Overview
ORBIT uses Nodemailer for production email sending with fallback to console logging in development.

## Environment Variables Required

Set these in your Replit Secrets (or production environment):

```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@orbitstaffing.io
```

## Setup Instructions

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate App Password**:
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the 16-character password

3. **Set Environment Variables**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=support@orbitstaffing.io
```

### Option 2: SendGrid (Production Recommended)

1. **Create SendGrid Account**: https://sendgrid.com
2. **Generate API Key**: Settings → API Keys → Create API Key
3. **Set Environment Variables**:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@orbitstaffing.io
```

### Option 3: AWS SES

1. **Create AWS SES Account** and verify domain
2. **Generate SMTP Credentials** from AWS Console
3. **Set Environment Variables**:
```
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
EMAIL_FROM=noreply@orbitstaffing.io
```

## Email Templates Active

Currently configured templates:

1. **iOS Launch Notification**
   - Sent when iOS app becomes available
   - HTML-formatted with brand styling

2. **Feature Update Notification**
   - Sent when feature request status changes
   - Includes feature name and status

3. **Support Ticket Confirmation**
   - Sent immediately when support ticket submitted
   - Auto-response with ticket ID
   - Includes support contact info

## Testing Email Sending

### Development Mode
If SMTP credentials are not set, emails log to console:
```
📧 EMAIL (Dev Mode)
To: user@example.com
Subject: Support Ticket Received - #ABC123 ✅
Body: [HTML content]
```

### Production Testing
```bash
curl -X POST http://localhost:5000/api/support/submit \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "subject": "Test Support Request",
    "message": "This is a test",
    "category": "general",
    "priority": "normal"
  }'
```

## Support Ticket Email Flow

1. **User submits ticket** via `/api/support/submit`
2. **Auto-response email** sent immediately
3. **Ticket saved** to PostgreSQL database
4. **Admin notified** (future feature)
5. **Response email** sent when ticket is resolved

## Monitoring & Debugging

### Check Email Service Status
```javascript
// In server/email.ts
const emailService = new EmailService();
```

### Debug Email Sending
- If `SMTP_HOST && SMTP_USER && SMTP_PASS` are set → Uses Nodemailer
- If any are missing → Falls back to console logging
- Check `/tmp/logs/` for console output in Replit

## Email Rate Limits

**Gmail**: 500 emails/day (free tier)
**SendGrid**: 100 emails/day (free tier) → Paid tiers: unlimited
**AWS SES**: 50,000 emails/day (included in AWS free tier)

## Next Steps

1. Choose your email provider
2. Generate credentials
3. Add environment variables to Replit Secrets
4. Test with support ticket endpoint
5. Verify emails arrive correctly
6. Monitor delivery and bounce rates

## Support Email Address

**For Users**: support@orbitstaffing.io
- Questions about platform
- Account issues
- Billing inquiries

**For Franchisees**: partner@orbitstaffing.io
- Partnership questions
- License management
- White-label customization

**For Developers**: dev@orbitstaffing.io
- API questions
- Integration support
- Technical issues

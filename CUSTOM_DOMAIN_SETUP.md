# Custom Domain Setup (orbitstaffing.io)

## Prerequisites
- ✅ Domain registered (orbitstaffing.io)
- ✅ Domain registrar access
- ⏳ App published on Replit (must do before configuring domain)

## Step-by-Step Setup

### Step 1: Publish Your App
1. Go to your Replit project
2. Click **"Publish"** button (top right)
3. Wait for deployment to complete
4. Note the temporary Replit domain (e.g., `project-name.replit.dev`)

### Step 2: Access Deployments Settings
1. In Replit, click **"Deployments"** tab
2. Select your published deployment
3. Click **"Settings"** (gear icon)
4. Look for **"Link a domain"** or **"Custom domain"** option

### Step 3: Add Custom Domain
1. Click **"Link a domain"** → "Manually connect from another registrar"
2. Enter your domain: `orbitstaffing.io`
3. Replit will display DNS records you need to add

### Step 4: Configure DNS Records

You'll receive something like:

```
Type: A
Name: @
Value: 12.345.67.89

Type: TXT
Name: _acme-challenge
Value: verification-token-here
```

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to **DNS Settings**
3. **Add A Record**:
   - Name: `@` (or leave blank)
   - Type: `A`
   - Value: `12.345.67.89` (from Replit)
   - TTL: `3600` (or auto)

4. **Add TXT Record** (for SSL verification):
   - Name: `_acme-challenge`
   - Type: `TXT`
   - Value: `verification-token-here`
   - TTL: `3600` (or auto)

5. **Add CNAME for www** (optional):
   - Name: `www`
   - Type: `CNAME`
   - Value: `orbitstaffing.io`

### Step 5: Wait for DNS Propagation
- **Time**: 1-48 hours (usually 5-30 minutes)
- **Check Status**: https://whatsmydns.net
- Enter your domain to see propagation progress

### Step 6: Verify Domain in Replit
1. Once DNS propagates, Replit will automatically verify
2. You'll see a green checkmark in Deployments → Settings
3. Domain is now live!

## Important Notes

### SSL/TLS Certificate
- ✅ Automatic via Let's Encrypt
- ✅ Replit handles renewal automatically
- ✅ No manual configuration needed

### Subdomain Setup (if needed)

**For `api.orbitstaffing.io`**:
1. Add A record:
   - Name: `api`
   - Type: `A`
   - Value: `12.345.67.89`

**For `admin.orbitstaffing.io`**:
1. Add A record:
   - Name: `admin`
   - Type: `A`
   - Value: `12.345.67.89`

### Email MX Records (if hosting email)

If you want to use email at orbitstaffing.io:

```
Type: MX
Name: @
Value: 10 mail.orbitstaffing.io
Priority: 10
```

(You'll need to configure mail server separately)

## Troubleshooting

### Domain Not Resolving
- **Check**: Run `nslookup orbitstaffing.io`
- **Wait**: DNS can take up to 48 hours
- **Flush**: Clear your local DNS cache
  - Windows: `ipconfig /flushdns`
  - Mac: `dscacheutil -flushcache`
  - Linux: `sudo systemctl restart nscd`

### SSL Certificate Error
- **Usually resolves** in 10-15 minutes after DNS propagation
- **Force refresh**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- **Check**: https://www.ssl-shopper.com/ssl-checker.html

### Still Not Working?
1. Verify A record in DNS Settings: `ping orbitstaffing.io`
2. Check Replit domain verification status
3. Contact Replit support if issue persists

## DNS Records Checklist

- [ ] A record added (`@` → Replit IP)
- [ ] TXT record added (for SSL verification)
- [ ] DNS propagation complete (check whatsmydns.net)
- [ ] Domain shows as verified in Replit
- [ ] Website accessible at orbitstaffing.io
- [ ] SSL certificate valid (green lock)
- [ ] App loads correctly

## After Domain Is Live

### Update Environment Variables
If needed, update API URLs:
```
OLD: https://project-name.replit.dev/api
NEW: https://orbitstaffing.io/api
```

### Update Mobile App Config
In `mobile/app.json`:
```json
"extra": {
  "apiUrl": "https://orbitstaffing.io/api",
  "sandboxApiUrl": "https://sandbox.orbitstaffing.io/api"
}
```

### Monitor Domain Health
- Check SSL certificate expiry (automatic renewal)
- Monitor uptime via status page
- Set up domain monitoring alerts

## Estimated Timeline
- Domain registered: ✅ Done
- App published: 5-10 minutes
- DNS configured: 5 minutes
- DNS propagated: 5-48 hours
- **Total**: Within 2 days for full setup

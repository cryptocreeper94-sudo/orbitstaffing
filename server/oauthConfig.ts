/**
 * OAuth Provider Configuration
 * Centralized configuration for all 16 OAuth integrations
 */

export interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  category: 'accounting' | 'hr' | 'productivity';
  description: string;
  permissions: string[];
}

export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  quickbooks: {
    name: 'QuickBooks Online',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scopes: ['com.intuit.quickbooks.accounting'],
    clientIdEnv: 'QUICKBOOKS_CLIENT_ID',
    clientSecretEnv: 'QUICKBOOKS_CLIENT_SECRET',
    category: 'accounting',
    description: 'Accounting & invoicing platform',
    permissions: [
      'Read employee/worker records',
      'Import customer data',
      'Sync invoice information',
      'Access basic company info',
    ],
  },
  adp: {
    name: 'ADP Workforce Now',
    authUrl: 'https://authorization.adp.com/auth/oauth/v2/authorize',
    tokenUrl: 'https://authorization.adp.com/auth/oauth/v2/token',
    scopes: ['employee', 'payroll'],
    clientIdEnv: 'ADP_CLIENT_ID',
    clientSecretEnv: 'ADP_CLIENT_SECRET',
    category: 'accounting',
    description: 'Payroll & HR management',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  paychex: {
    name: 'Paychex Flex',
    authUrl: 'https://login.paychex.com/authorize',
    tokenUrl: 'https://api.paychex.com/auth/oauth/v2/token',
    scopes: ['employees', 'payroll'],
    clientIdEnv: 'PAYCHEX_CLIENT_ID',
    clientSecretEnv: 'PAYCHEX_CLIENT_SECRET',
    category: 'accounting',
    description: 'Payroll, HR, and benefits',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  gusto: {
    name: 'Gusto',
    authUrl: 'https://api.gusto.com/oauth/authorize',
    tokenUrl: 'https://api.gusto.com/oauth/token',
    scopes: ['employees:read', 'payrolls:read'],
    clientIdEnv: 'GUSTO_CLIENT_ID',
    clientSecretEnv: 'GUSTO_CLIENT_SECRET',
    category: 'accounting',
    description: 'Modern payroll & benefits',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  rippling: {
    name: 'Rippling',
    authUrl: 'https://api.rippling.com/oauth/authorize',
    tokenUrl: 'https://api.rippling.com/oauth/token',
    scopes: ['employees:read', 'payroll:read'],
    clientIdEnv: 'RIPPLING_CLIENT_ID',
    clientSecretEnv: 'RIPPLING_CLIENT_SECRET',
    category: 'accounting',
    description: 'All-in-one HR platform',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  onpay: {
    name: 'OnPay',
    authUrl: 'https://api.onpay.com/oauth/authorize',
    tokenUrl: 'https://api.onpay.com/oauth/token',
    scopes: ['employees', 'payroll'],
    clientIdEnv: 'ONPAY_CLIENT_ID',
    clientSecretEnv: 'ONPAY_CLIENT_SECRET',
    category: 'accounting',
    description: 'Small business payroll',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  bamboohr: {
    name: 'BambooHR',
    authUrl: 'https://api.bamboohr.com/oauth/authorize',
    tokenUrl: 'https://api.bamboohr.com/oauth/token',
    scopes: ['employees:read'],
    clientIdEnv: 'BAMBOOHR_CLIENT_ID',
    clientSecretEnv: 'BAMBOOHR_CLIENT_SECRET',
    category: 'hr',
    description: 'HR management system',
    permissions: [
      'Read employee/worker records',
      'Import HR data',
      'Sync employee directory',
      'Access basic company info',
    ],
  },
  bullhorn: {
    name: 'Bullhorn ATS',
    authUrl: 'https://auth.bullhornstaffing.com/oauth/authorize',
    tokenUrl: 'https://auth.bullhornstaffing.com/oauth/token',
    scopes: ['candidates', 'placements'],
    clientIdEnv: 'BULLHORN_CLIENT_ID',
    clientSecretEnv: 'BULLHORN_CLIENT_SECRET',
    category: 'hr',
    description: 'Applicant tracking system',
    permissions: [
      'Read candidate records',
      'Import placement data',
      'Sync staffing information',
      'Access basic company info',
    ],
  },
  wurknow: {
    name: 'WurkNow',
    authUrl: 'https://api.wurknow.com/oauth/authorize',
    tokenUrl: 'https://api.wurknow.com/oauth/token',
    scopes: ['workers', 'assignments'],
    clientIdEnv: 'WURKNOW_CLIENT_ID',
    clientSecretEnv: 'WURKNOW_CLIENT_SECRET',
    category: 'hr',
    description: 'Cannabis workforce platform',
    permissions: [
      'Read worker records',
      'Import assignment data',
      'Sync compliance information',
      'Access basic company info',
    ],
  },
  ukgpro: {
    name: 'UKG Pro',
    authUrl: 'https://service.ultipro.com/oauth/authorize',
    tokenUrl: 'https://service.ultipro.com/oauth/token',
    scopes: ['employees', 'payroll'],
    clientIdEnv: 'UKGPRO_CLIENT_ID',
    clientSecretEnv: 'UKGPRO_CLIENT_SECRET',
    category: 'hr',
    description: 'Workforce management',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  workday: {
    name: 'Workday',
    authUrl: 'https://wd2-impl-services1.workday.com/ccx/oauth2/authorize',
    tokenUrl: 'https://wd2-impl-services1.workday.com/ccx/oauth2/token',
    scopes: ['workers', 'compensation'],
    clientIdEnv: 'WORKDAY_CLIENT_ID',
    clientSecretEnv: 'WORKDAY_CLIENT_SECRET',
    category: 'hr',
    description: 'Enterprise HR & finance',
    permissions: [
      'Read employee/worker records',
      'Import compensation data',
      'Sync organizational structure',
      'Access basic company info',
    ],
  },
  google: {
    name: 'Google Workspace',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
    ],
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    category: 'productivity',
    description: 'Email & collaboration suite',
    permissions: [
      'Read user directory',
      'Import organizational structure',
      'Sync employee emails',
      'Access basic company info',
    ],
  },
  microsoft: {
    name: 'Microsoft 365',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['User.Read.All', 'Directory.Read.All'],
    clientIdEnv: 'MICROSOFT_CLIENT_ID',
    clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    category: 'productivity',
    description: 'Office & productivity suite',
    permissions: [
      'Read user directory',
      'Import organizational structure',
      'Sync employee data',
      'Access basic company info',
    ],
  },
  paylocity: {
    name: 'Paylocity',
    authUrl: 'https://api.paylocity.com/oauth/authorize',
    tokenUrl: 'https://api.paylocity.com/oauth/token',
    scopes: ['employees', 'payroll'],
    clientIdEnv: 'PAYLOCITY_CLIENT_ID',
    clientSecretEnv: 'PAYLOCITY_CLIENT_SECRET',
    category: 'accounting',
    description: 'Payroll & HR software',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  namely: {
    name: 'Namely',
    authUrl: 'https://api.namely.com/oauth/authorize',
    tokenUrl: 'https://api.namely.com/oauth/token',
    scopes: ['employees:read', 'payroll:read'],
    clientIdEnv: 'NAMELY_CLIENT_ID',
    clientSecretEnv: 'NAMELY_CLIENT_SECRET',
    category: 'hr',
    description: 'HR platform for mid-sized companies',
    permissions: [
      'Read employee/worker records',
      'Import HR data',
      'Sync employee directory',
      'Access basic company info',
    ],
  },
  zenefits: {
    name: 'Zenefits',
    authUrl: 'https://secure.zenefits.com/oauth2/authorize',
    tokenUrl: 'https://secure.zenefits.com/oauth2/token',
    scopes: ['people:read', 'employment:read'],
    clientIdEnv: 'ZENEFITS_CLIENT_ID',
    clientSecretEnv: 'ZENEFITS_CLIENT_SECRET',
    category: 'hr',
    description: 'HR, benefits, and payroll',
    permissions: [
      'Read employee/worker records',
      'Import benefits data',
      'Sync HR information',
      'Access basic company info',
    ],
  },
};

export function generateAuthUrl(
  provider: string,
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${config.authUrl}?${params.toString()}`;
}

export function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function exchangeCodeForToken(
  provider: string,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
}> {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
    scope: data.scope,
  };
}

export async function refreshAccessToken(
  provider: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in || 3600,
  };
}

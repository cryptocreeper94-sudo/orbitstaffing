import axios from "axios";

// ========================
// OAUTH PROVIDER CONFIGS
// ========================
const OAUTH_CONFIGS: Record<string, any> = {
  quickbooks: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID || "placeholder",
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:5000/api/oauth/quickbooks/callback",
    authorizationUrl: "https://appcenter.intuit.com/connect/oauth2",
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/tokens/oauth",
    apiBaseUrl: "https://quickbooks.api.intuit.com/v2/company",
    scope: "com.intuit.quickbooks.accounting",
    authType: "basic", // Uses Basic Auth for token exchange
  },
  adp: {
    clientId: process.env.ADP_CLIENT_ID || "placeholder",
    clientSecret: process.env.ADP_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.ADP_REDIRECT_URI || "http://localhost:5000/api/oauth/adp/callback",
    authorizationUrl: "https://accounts.adp.com/auth/oauth/v2/authorize",
    tokenUrl: "https://accounts.adp.com/auth/oauth/v2/token",
    apiBaseUrl: "https://api.adp.com",
    scope: "hr/workers:read hr/workers:write payroll/payroll_runs:read",
    authType: "body", // Includes credentials in body
  },
  paychex: {
    clientId: process.env.PAYCHEX_CLIENT_ID || "placeholder",
    clientSecret: process.env.PAYCHEX_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.PAYCHEX_REDIRECT_URI || "http://localhost:5000/api/oauth/paychex/callback",
    authorizationUrl: "https://account.paychex.com/oauth/authorize",
    tokenUrl: "https://account.paychex.com/oauth/token",
    apiBaseUrl: "https://api.paychex.com/v1",
    scope: "payroll:read payroll:write",
    authType: "body",
  },
  gusto: {
    clientId: process.env.GUSTO_CLIENT_ID || "placeholder",
    clientSecret: process.env.GUSTO_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.GUSTO_REDIRECT_URI || "http://localhost:5000/api/oauth/gusto/callback",
    authorizationUrl: "https://app.gusto.com/oauth/authorize",
    tokenUrl: "https://api.gusto.com/oauth/token",
    apiBaseUrl: "https://api.gusto.com/v1",
    scope: "payroll:read payroll:write",
    authType: "basic",
  },
  rippling: {
    clientId: process.env.RIPPLING_CLIENT_ID || "placeholder",
    clientSecret: process.env.RIPPLING_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.RIPPLING_REDIRECT_URI || "http://localhost:5000/api/oauth/rippling/callback",
    authorizationUrl: "https://app.rippling.com/oauth/authorize",
    tokenUrl: "https://api.rippling.com/oauth/token",
    apiBaseUrl: "https://api.rippling.com/v1",
    scope: "payroll:read employees:read",
    authType: "body",
  },
  workday: {
    clientId: process.env.WORKDAY_CLIENT_ID || "placeholder",
    clientSecret: process.env.WORKDAY_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.WORKDAY_REDIRECT_URI || "http://localhost:5000/api/oauth/workday/callback",
    authorizationUrl: "https://api.workday.com/oauth/authorize",
    tokenUrl: "https://api.workday.com/oauth/token",
    apiBaseUrl: "https://api.workday.com/v1",
    scope: "payroll:read employees:read",
    authType: "basic",
  },
  paylocity: {
    clientId: process.env.PAYLOCITY_CLIENT_ID || "placeholder",
    clientSecret: process.env.PAYLOCITY_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.PAYLOCITY_REDIRECT_URI || "http://localhost:5000/api/oauth/paylocity/callback",
    authorizationUrl: "https://app.paylocity.com/oauth/authorize",
    tokenUrl: "https://api.paylocity.com/oauth/token",
    apiBaseUrl: "https://api.paylocity.com/v1",
    scope: "payroll:read employees:read",
    authType: "basic",
  },
  onpay: {
    clientId: process.env.ONPAY_CLIENT_ID || "placeholder",
    clientSecret: process.env.ONPAY_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.ONPAY_REDIRECT_URI || "http://localhost:5000/api/oauth/onpay/callback",
    authorizationUrl: "https://app.onpay.com/oauth/authorize",
    tokenUrl: "https://api.onpay.com/oauth/token",
    apiBaseUrl: "https://api.onpay.com/v1",
    scope: "payroll:read",
    authType: "body",
  },
  bullhorn: {
    clientId: process.env.BULLHORN_CLIENT_ID || "placeholder",
    clientSecret: process.env.BULLHORN_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.BULLHORN_REDIRECT_URI || "http://localhost:5000/api/oauth/bullhorn/callback",
    authorizationUrl: "https://auth.bullhornstaffing.com/oauth/authorize",
    tokenUrl: "https://auth.bullhornstaffing.com/oauth/token",
    apiBaseUrl: "https://rest.bullhornstaffing.com/rest-services",
    scope: "staffing:read staffing:write",
    authType: "basic",
  },
  wurknow: {
    clientId: process.env.WURKNOW_CLIENT_ID || "placeholder",
    clientSecret: process.env.WURKNOW_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.WURKNOW_REDIRECT_URI || "http://localhost:5000/api/oauth/wurknow/callback",
    authorizationUrl: "https://app.wurknow.com/oauth/authorize",
    tokenUrl: "https://api.wurknow.com/oauth/token",
    apiBaseUrl: "https://api.wurknow.com/v1",
    scope: "staffing:read staffing:write",
    authType: "body",
  },
  ukgpro: {
    clientId: process.env.UKGPRO_CLIENT_ID || "placeholder",
    clientSecret: process.env.UKGPRO_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.UKGPRO_REDIRECT_URI || "http://localhost:5000/api/oauth/ukgpro/callback",
    authorizationUrl: "https://oauth.ukg.com/oauth/authorize",
    tokenUrl: "https://oauth.ukg.com/oauth/token",
    apiBaseUrl: "https://api.ukg.com/v1",
    scope: "payroll:read employees:read scheduling:read",
    authType: "basic",
  },
  bamboohr: {
    clientId: process.env.BAMBOOHR_CLIENT_ID || "placeholder",
    clientSecret: process.env.BAMBOOHR_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.BAMBOOHR_REDIRECT_URI || "http://localhost:5000/api/oauth/bamboohr/callback",
    authorizationUrl: "https://app.bamboohr.com/oauth/authorize",
    tokenUrl: "https://api.bamboohr.com/oauth/token",
    apiBaseUrl: "https://api.bamboohr.com/v1",
    scope: "employees:read",
    authType: "body",
  },
  "google-workspace": {
    clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/oauth/google-workspace/callback",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    apiBaseUrl: "https://www.googleapis.com",
    scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts",
    authType: "body",
  },
  "microsoft-365": {
    clientId: process.env.MICROSOFT_CLIENT_ID || "placeholder",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "placeholder",
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || "http://localhost:5000/api/oauth/microsoft-365/callback",
    authorizationUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    apiBaseUrl: "https://graph.microsoft.com/v1.0",
    scope: "Files.Read.All Calendars.Read Mail.Read offline_access",
    authType: "body",
  },
};

// ========================
// GENERIC OAUTH HANDLER
// ========================
export const oauthClients = {
  // Get auth URL for any provider
  getAuthUrl(integrationType: string, state: string): string {
    const config = OAUTH_CONFIGS[integrationType];
    if (!config) throw new Error(`Unknown integration type: ${integrationType}`);

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: "code",
      scope: config.scope,
      redirect_uri: config.redirectUri,
      state,
    });
    return `${config.authorizationUrl}?${params.toString()}`;
  },

  // Exchange code for token (generic handler)
  async exchangeCode(integrationType: string, code: string, metadata?: any) {
    try {
      const config = OAUTH_CONFIGS[integrationType];
      if (!config) throw new Error(`Unknown integration type: ${integrationType}`);

      const axiosConfig: any = {};

      // Handle different auth types
      if (config.authType === "basic") {
        axiosConfig.auth = {
          username: config.clientId,
          password: config.clientSecret,
        };
      }

      const tokenData: any = {
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
      };

      // Add client credentials to body if not using Basic Auth
      if (config.authType === "body") {
        tokenData.client_id = config.clientId;
        tokenData.client_secret = config.clientSecret;
      }

      const response = await axios.post(config.tokenUrl, tokenData, axiosConfig);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || null,
        expiresAt: new Date(Date.now() + (response.data.expires_in || 3600) * 1000),
        scope: response.data.scope || config.scope,
        ...metadata,
      };
    } catch (error) {
      console.error(`${integrationType} token exchange failed:`, error);
      throw error;
    }
  },

  // Refresh token for any provider
  async refreshToken(integrationType: string, refreshToken: string) {
    try {
      const config = OAUTH_CONFIGS[integrationType];
      if (!config) throw new Error(`Unknown integration type: ${integrationType}`);
      if (!refreshToken) throw new Error("No refresh token available");

      const axiosConfig: any = {};

      if (config.authType === "basic") {
        axiosConfig.auth = {
          username: config.clientId,
          password: config.clientSecret,
        };
      }

      const tokenData: any = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      };

      if (config.authType === "body") {
        tokenData.client_id = config.clientId;
        tokenData.client_secret = config.clientSecret;
      }

      const response = await axios.post(config.tokenUrl, tokenData, axiosConfig);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + (response.data.expires_in || 3600) * 1000),
        scope: response.data.scope,
      };
    } catch (error) {
      console.error(`${integrationType} token refresh failed:`, error);
      throw error;
    }
  },

  // Generic API call for any provider
  async callAPI(
    integrationType: string,
    accessToken: string,
    endpoint: string,
    method: string = "GET",
    data?: any
  ) {
    try {
      const config = OAUTH_CONFIGS[integrationType];
      if (!config) throw new Error(`Unknown integration type: ${integrationType}`);

      const url = `${config.apiBaseUrl}${endpoint}`;
      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error(`${integrationType} API call failed:`, error);
      throw error;
    }
  },

  // Get config for a provider
  getConfig(integrationType: string) {
    return OAUTH_CONFIGS[integrationType];
  },

  // Check if provider is configured
  isConfigured(integrationType: string): boolean {
    const config = OAUTH_CONFIGS[integrationType];
    if (!config) return false;
    return (
      config.clientId !== "placeholder" &&
      config.clientSecret !== "placeholder"
    );
  },
};

import axios from "axios";

const QUICKBOOKS_CONFIG = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID || "placeholder",
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "placeholder",
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:5000/api/oauth/quickbooks/callback",
  authorizationUrl: "https://appcenter.intuit.com/connect/oauth2",
  tokenUrl: "https://oauth.platform.intuit.com/oauth2/tokens/oauth",
  apiBaseUrl: "https://quickbooks.api.intuit.com/v2/company",
};

const ADP_CONFIG = {
  clientId: process.env.ADP_CLIENT_ID || "placeholder",
  clientSecret: process.env.ADP_CLIENT_SECRET || "placeholder",
  redirectUri: process.env.ADP_REDIRECT_URI || "http://localhost:5000/api/oauth/adp/callback",
  authorizationUrl: "https://accounts.adp.com/auth/oauth/v2/authorize",
  tokenUrl: "https://accounts.adp.com/auth/oauth/v2/token",
  apiBaseUrl: "https://api.adp.com",
};

export const oauthClients = {
  // QuickBooks OAuth Flow
  getQuickBooksAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: QUICKBOOKS_CONFIG.clientId,
      response_type: "code",
      scope: "com.intuit.quickbooks.accounting",
      redirect_uri: QUICKBOOKS_CONFIG.redirectUri,
      state,
    });
    return `${QUICKBOOKS_CONFIG.authorizationUrl}?${params.toString()}`;
  },

  async exchangeQuickBooksCode(code: string, realmId: string) {
    try {
      const response = await axios.post(QUICKBOOKS_CONFIG.tokenUrl, {
        grant_type: "authorization_code",
        code,
        redirect_uri: QUICKBOOKS_CONFIG.redirectUri,
      }, {
        auth: {
          username: QUICKBOOKS_CONFIG.clientId,
          password: QUICKBOOKS_CONFIG.clientSecret,
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
        scope: response.data.x_refresh_token_expires_in ? "com.intuit.quickbooks.accounting" : undefined,
        realmId,
      };
    } catch (error) {
      console.error("QuickBooks token exchange failed:", error);
      throw error;
    }
  },

  // ADP OAuth Flow
  getADPAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: ADP_CONFIG.clientId,
      response_type: "code",
      scope: "hr/workers:read hr/workers:write payroll/payroll_runs:read",
      redirect_uri: ADP_CONFIG.redirectUri,
      state,
    });
    return `${ADP_CONFIG.authorizationUrl}?${params.toString()}`;
  },

  async exchangeADPCode(code: string) {
    try {
      const response = await axios.post(ADP_CONFIG.tokenUrl, {
        grant_type: "authorization_code",
        code,
        redirect_uri: ADP_CONFIG.redirectUri,
        client_id: ADP_CONFIG.clientId,
        client_secret: ADP_CONFIG.clientSecret,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
        scope: response.data.scope,
      };
    } catch (error) {
      console.error("ADP token exchange failed:", error);
      throw error;
    }
  },

  // Token Refresh Methods
  async refreshQuickBooksToken(refreshToken: string) {
    try {
      const response = await axios.post(QUICKBOOKS_CONFIG.tokenUrl, {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }, {
        auth: {
          username: QUICKBOOKS_CONFIG.clientId,
          password: QUICKBOOKS_CONFIG.clientSecret,
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      };
    } catch (error) {
      console.error("QuickBooks token refresh failed:", error);
      throw error;
    }
  },

  async refreshADPToken(refreshToken: string) {
    try {
      const response = await axios.post(ADP_CONFIG.tokenUrl, {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: ADP_CONFIG.clientId,
        client_secret: ADP_CONFIG.clientSecret,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      };
    } catch (error) {
      console.error("ADP token refresh failed:", error);
      throw error;
    }
  },

  // API Call Methods
  async getQuickBooksData(accessToken: string, realmId: string, endpoint: string) {
    try {
      const response = await axios.get(
        `${QUICKBOOKS_CONFIG.apiBaseUrl}/${realmId}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("QuickBooks API call failed:", error);
      throw error;
    }
  },

  async getADPData(accessToken: string, endpoint: string) {
    try {
      const response = await axios.get(`${ADP_CONFIG.apiBaseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("ADP API call failed:", error);
      throw error;
    }
  },
};

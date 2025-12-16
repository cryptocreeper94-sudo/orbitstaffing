import crypto from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, and, isNull, gt, lt } from "drizzle-orm";
import {
  oauthClients,
  oauthAuthorizationCodes,
  oauthAccessTokens,
  users,
  type OAuthClient,
  type OAuthAuthorizationCode,
  type OAuthAccessToken,
  type User,
  PARTNER_API_SCOPES,
} from "@shared/schema";

const TOKEN_EXPIRY_SECONDS = 3600;
const REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 3600;
const AUTH_CODE_EXPIRY_SECONDS = 600;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface AuthCodeParams {
  clientId: string;
  userId?: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

interface TokenExchangeParams {
  code: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  codeVerifier?: string;
}

interface ClientCredentialsParams {
  clientId: string;
  clientSecret: string;
  scope?: string;
}

function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64url");
}

function generateClientId(): string {
  return `orbit_${generateSecureToken(16)}`;
}

function generateClientSecret(): string {
  return generateSecureToken(32);
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("base64url");
}

export const oauthService = {
  async createClient(params: {
    tenantId?: string;
    name: string;
    description?: string;
    redirectUris: string[];
    scopes: string[];
    grantTypes: string[];
    isConfidential?: boolean;
    logoUrl?: string;
    homepageUrl?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  }): Promise<{ client: OAuthClient; clientSecret: string }> {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const clientSecretHash = await bcrypt.hash(clientSecret, 12);

    const validScopes = params.scopes.filter((s) =>
      PARTNER_API_SCOPES.includes(s as any)
    );
    const validGrantTypes = params.grantTypes.filter((g) =>
      ["authorization_code", "client_credentials", "refresh_token"].includes(g)
    );

    const [client] = await db
      .insert(oauthClients)
      .values({
        tenantId: params.tenantId || null,
        clientId,
        clientSecretHash,
        name: params.name,
        description: params.description,
        redirectUris: params.redirectUris,
        scopes: validScopes,
        grantTypes: validGrantTypes,
        isConfidential: params.isConfidential ?? true,
        logoUrl: params.logoUrl,
        homepageUrl: params.homepageUrl,
        privacyPolicyUrl: params.privacyPolicyUrl,
        termsOfServiceUrl: params.termsOfServiceUrl,
      })
      .returning();

    return { client, clientSecret };
  },

  async getClientByClientId(clientId: string): Promise<OAuthClient | null> {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.clientId, clientId))
      .limit(1);
    return client || null;
  },

  async getClientById(id: string): Promise<OAuthClient | null> {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.id, id))
      .limit(1);
    return client || null;
  },

  async validateClientCredentials(
    clientId: string,
    clientSecret: string
  ): Promise<OAuthClient | null> {
    const client = await this.getClientByClientId(clientId);
    if (!client || !client.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(clientSecret, client.clientSecretHash);
    return isValid ? client : null;
  },

  async listClients(tenantId?: string): Promise<OAuthClient[]> {
    if (tenantId) {
      return await db
        .select()
        .from(oauthClients)
        .where(eq(oauthClients.tenantId, tenantId));
    }
    return await db.select().from(oauthClients);
  },

  async deleteClient(id: string): Promise<boolean> {
    await db
      .delete(oauthAccessTokens)
      .where(eq(oauthAccessTokens.clientId, id));
    await db
      .delete(oauthAuthorizationCodes)
      .where(eq(oauthAuthorizationCodes.clientId, id));
    const result = await db
      .delete(oauthClients)
      .where(eq(oauthClients.id, id))
      .returning();
    return result.length > 0;
  },

  async updateClient(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      redirectUris: string[];
      scopes: string[];
      grantTypes: string[];
      isActive: boolean;
      logoUrl: string;
      homepageUrl: string;
      privacyPolicyUrl: string;
      termsOfServiceUrl: string;
    }>
  ): Promise<OAuthClient | null> {
    const [updated] = await db
      .update(oauthClients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(oauthClients.id, id))
      .returning();
    return updated || null;
  },

  async generateAuthorizationCode(
    params: AuthCodeParams
  ): Promise<{ code: string; expiresAt: Date }> {
    const client = await this.getClientByClientId(params.clientId);
    if (!client) {
      throw new Error("Invalid client");
    }

    if (!client.redirectUris.includes(params.redirectUri)) {
      throw new Error("Invalid redirect URI");
    }

    const code = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRY_SECONDS * 1000);

    await db.insert(oauthAuthorizationCodes).values({
      clientId: client.id,
      userId: params.userId || null,
      code,
      redirectUri: params.redirectUri,
      scope: params.scope,
      state: params.state,
      codeChallenge: params.codeChallenge,
      codeChallengeMethod: params.codeChallengeMethod || "S256",
      expiresAt,
    });

    return { code, expiresAt };
  },

  async exchangeCodeForTokens(
    params: TokenExchangeParams
  ): Promise<TokenResponse> {
    const [authCode] = await db
      .select()
      .from(oauthAuthorizationCodes)
      .where(
        and(
          eq(oauthAuthorizationCodes.code, params.code),
          isNull(oauthAuthorizationCodes.usedAt)
        )
      )
      .limit(1);

    if (!authCode) {
      throw new Error("Invalid or expired authorization code");
    }

    if (new Date() > authCode.expiresAt) {
      throw new Error("Authorization code has expired");
    }

    if (authCode.redirectUri !== params.redirectUri) {
      throw new Error("Redirect URI mismatch");
    }

    const client = await this.getClientById(authCode.clientId);
    if (!client) {
      throw new Error("Invalid client");
    }

    if (client.clientId !== params.clientId) {
      throw new Error("Client ID mismatch");
    }

    if (authCode.codeChallenge) {
      if (!params.codeVerifier) {
        throw new Error("Code verifier required for PKCE");
      }
      const computedChallenge = sha256(params.codeVerifier);
      if (computedChallenge !== authCode.codeChallenge) {
        throw new Error("Invalid code verifier");
      }
    } else if (client.isConfidential) {
      if (!params.clientSecret) {
        throw new Error("Client secret required");
      }
      const isValid = await bcrypt.compare(
        params.clientSecret,
        client.clientSecretHash
      );
      if (!isValid) {
        throw new Error("Invalid client credentials");
      }
    }

    await db
      .update(oauthAuthorizationCodes)
      .set({ usedAt: new Date() })
      .where(eq(oauthAuthorizationCodes.id, authCode.id));

    const accessToken = generateSecureToken(32);
    const refreshToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000);
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000
    );

    await db.insert(oauthAccessTokens).values({
      clientId: client.id,
      userId: authCode.userId,
      accessToken,
      refreshToken,
      scope: authCode.scope,
      expiresAt,
      refreshExpiresAt,
    });

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: TOKEN_EXPIRY_SECONDS,
      refresh_token: refreshToken,
      scope: authCode.scope || undefined,
    };
  },

  async clientCredentialsGrant(
    params: ClientCredentialsParams
  ): Promise<TokenResponse> {
    const client = await this.validateClientCredentials(
      params.clientId,
      params.clientSecret
    );

    if (!client) {
      throw new Error("Invalid client credentials");
    }

    if (!client.grantTypes.includes("client_credentials")) {
      throw new Error("Client credentials grant not allowed");
    }

    const requestedScopes = params.scope?.split(" ") || [];
    const validScopes = requestedScopes.filter((s) =>
      client.scopes.includes(s)
    );
    const scope = validScopes.length > 0 ? validScopes.join(" ") : client.scopes.join(" ");

    const accessToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000);

    await db.insert(oauthAccessTokens).values({
      clientId: client.id,
      userId: null,
      accessToken,
      refreshToken: null,
      scope,
      expiresAt,
      refreshExpiresAt: null,
    });

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: TOKEN_EXPIRY_SECONDS,
      scope,
    };
  },

  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret?: string
  ): Promise<TokenResponse> {
    const [existingToken] = await db
      .select()
      .from(oauthAccessTokens)
      .where(
        and(
          eq(oauthAccessTokens.refreshToken, refreshToken),
          isNull(oauthAccessTokens.revokedAt)
        )
      )
      .limit(1);

    if (!existingToken) {
      throw new Error("Invalid refresh token");
    }

    if (
      existingToken.refreshExpiresAt &&
      new Date() > existingToken.refreshExpiresAt
    ) {
      throw new Error("Refresh token has expired");
    }

    const client = await this.getClientById(existingToken.clientId);
    if (!client || client.clientId !== clientId) {
      throw new Error("Invalid client");
    }

    if (client.isConfidential && clientSecret) {
      const isValid = await bcrypt.compare(
        clientSecret,
        client.clientSecretHash
      );
      if (!isValid) {
        throw new Error("Invalid client credentials");
      }
    }

    await db
      .update(oauthAccessTokens)
      .set({ revokedAt: new Date() })
      .where(eq(oauthAccessTokens.id, existingToken.id));

    const newAccessToken = generateSecureToken(32);
    const newRefreshToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000);
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000
    );

    await db.insert(oauthAccessTokens).values({
      clientId: client.id,
      userId: existingToken.userId,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      scope: existingToken.scope,
      expiresAt,
      refreshExpiresAt,
    });

    return {
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: TOKEN_EXPIRY_SECONDS,
      refresh_token: newRefreshToken,
      scope: existingToken.scope || undefined,
    };
  },

  async revokeToken(token: string): Promise<boolean> {
    const [result] = await db
      .update(oauthAccessTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(oauthAccessTokens.accessToken, token),
          isNull(oauthAccessTokens.revokedAt)
        )
      )
      .returning();

    if (result) {
      return true;
    }

    const [refreshResult] = await db
      .update(oauthAccessTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(oauthAccessTokens.refreshToken, token),
          isNull(oauthAccessTokens.revokedAt)
        )
      )
      .returning();

    return !!refreshResult;
  },

  async validateAccessToken(
    accessToken: string
  ): Promise<{ token: OAuthAccessToken; client: OAuthClient; user?: User } | null> {
    const [token] = await db
      .select()
      .from(oauthAccessTokens)
      .where(
        and(
          eq(oauthAccessTokens.accessToken, accessToken),
          isNull(oauthAccessTokens.revokedAt)
        )
      )
      .limit(1);

    if (!token) {
      return null;
    }

    if (new Date() > token.expiresAt) {
      return null;
    }

    const client = await this.getClientById(token.clientId);
    if (!client || !client.isActive) {
      return null;
    }

    await db
      .update(oauthAccessTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(oauthAccessTokens.id, token.id));

    let user: User | undefined;
    if (token.userId) {
      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, token.userId))
        .limit(1);
      user = foundUser;
    }

    return { token, client, user };
  },

  async introspectToken(
    accessToken: string
  ): Promise<{
    active: boolean;
    scope?: string;
    client_id?: string;
    username?: string;
    exp?: number;
    iat?: number;
  }> {
    const result = await this.validateAccessToken(accessToken);

    if (!result) {
      return { active: false };
    }

    return {
      active: true,
      scope: result.token.scope || undefined,
      client_id: result.client.clientId,
      username: result.user?.email,
      exp: Math.floor(result.token.expiresAt.getTime() / 1000),
      iat: Math.floor(result.token.createdAt!.getTime() / 1000),
    };
  },

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    
    const deletedCodes = await db
      .delete(oauthAuthorizationCodes)
      .where(lt(oauthAuthorizationCodes.expiresAt, now))
      .returning();

    const expiredTokens = await db
      .update(oauthAccessTokens)
      .set({ revokedAt: now })
      .where(
        and(
          lt(oauthAccessTokens.expiresAt, now),
          isNull(oauthAccessTokens.revokedAt)
        )
      )
      .returning();

    return deletedCodes.length + expiredTokens.length;
  },

  validateRedirectUri(uri: string): boolean {
    try {
      const url = new URL(uri);
      if (url.protocol === "http:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        return false;
      }
      if (url.hash) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  validateScopes(requestedScopes: string[], clientScopes: string[]): string[] {
    return requestedScopes.filter((s) => clientScopes.includes(s));
  },
};

export default oauthService;

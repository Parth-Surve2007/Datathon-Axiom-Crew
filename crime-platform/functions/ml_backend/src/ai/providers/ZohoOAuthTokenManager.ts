export interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  api_domain?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export class ZohoOAuthTokenError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
    readonly rawBody: string
  ) {
    super(message);
    this.name = 'ZohoOAuthTokenError';
  }
}

interface CachedAccessToken {
  value: string;
  expiresAt: number;
}

export class ZohoOAuthTokenManager {
  private cachedAccessToken?: CachedAccessToken;
  private refreshInFlight?: Promise<string>;

  constructor(
    private readonly clientId = process.env.CATALYST_CLIENT_ID,
    private readonly clientSecret = process.env.CATALYST_CLIENT_SECRET,
    private readonly accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
    private readonly refreshToken = process.env.ZOHO_REFRESH_TOKEN || process.env.CATALYST_REFRESH_TOKEN,
    private readonly redirectUri = process.env.CATALYST_REDIRECT_URL
  ) {}

  buildAuthorizationUrl(state?: string): string {
    this.assertClientConfig();

    if (!this.redirectUri) {
      throw new Error('CATALYST_REDIRECT_URL is required to build the Zoho authorization URL.');
    }

    const url = new URL('/oauth/v2/auth', this.accountsUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId as string);
    url.searchParams.set('scope', 'QuickML.deployment.READ');
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    if (state) url.searchParams.set('state', state);
    return url.toString();
  }

  async exchangeAuthorizationCode(code: string, redirectUri = this.redirectUri): Promise<ZohoTokenResponse> {
    this.assertClientConfig();

    if (!redirectUri) {
      throw new Error('CATALYST_REDIRECT_URL is required to exchange a Zoho authorization code.');
    }

    return this.requestToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (!forceRefresh && this.cachedAccessToken && this.cachedAccessToken.expiresAt > now) {
      return this.cachedAccessToken.value;
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAccessToken().finally(() => {
        this.refreshInFlight = undefined;
      });
    }

    return this.refreshInFlight;
  }

  private async refreshAccessToken(): Promise<string> {
    this.assertClientConfig();

    if (!this.refreshToken) {
      throw new Error('ZOHO_REFRESH_TOKEN or CATALYST_REFRESH_TOKEN is required for automatic Catalyst QuickML token refresh.');
    }

    const token = await this.requestToken({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });

    if (!token.access_token) {
      throw new Error(`Zoho OAuth refresh response did not include access_token. ${this.describeTokenError(token)}`);
    }

    const expiresInSeconds = token.expires_in || 3600;
    this.cachedAccessToken = {
      value: token.access_token,
      expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
    };

    return token.access_token;
  }

  private async requestToken(params: Record<string, string>): Promise<ZohoTokenResponse> {
    const url = new URL('/oauth/v2/token', this.accountsUrl);
    const body = new URLSearchParams();
    body.set('grant_type', params.grant_type);
    body.set('client_id', this.clientId as string);
    body.set('client_secret', this.clientSecret as string);
    if (params.redirect_uri) body.set('redirect_uri', params.redirect_uri);
    if (params.code) body.set('code', params.code);
    if (params.refresh_token) body.set('refresh_token', params.refresh_token);

    const sanitizedBody = new URLSearchParams(body);
    sanitizedBody.set('client_secret', '[REDACTED]');
    const redirectUriMatchesAuthorizationUrl = params.redirect_uri
      ? params.redirect_uri === this.redirectUri
      : undefined;

    console.info('=== NEW OAUTH BUILD ===');
    console.info('Zoho OAuth token request', {
      urlHasQueryParams: url.search.length > 0,
      method: 'POST',
      url: url.toString(),
      tokenEndpointMatchesZohoDocs: url.toString() === 'https://accounts.zoho.in/oauth/v2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: sanitizedBody.toString(),
      bodyKeys: Array.from(body.keys()),
      duplicateBodyKeys: this.findDuplicateKeys(body),
      env: {
        CATALYST_CLIENT_ID: this.inspectEnvValue(this.clientId),
        CATALYST_CLIENT_SECRET: this.inspectEnvValue(this.clientSecret, true),
        CATALYST_REDIRECT_URL: this.inspectEnvValue(this.redirectUri),
        ZOHO_ACCOUNTS_URL: this.inspectEnvValue(this.accountsUrl)
      },
      codeLength: params.code?.length,
      redirectUriMatchesAuthorizationUrl,
      authorizationRedirectUri: this.redirectUri,
      tokenExchangeRedirectUri: params.redirect_uri
    });

    const { response, redirectChain } = await this.fetchWithRedirectAudit(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body
    });
    const rawBody = await response.text();
    const payload = this.parseTokenResponse(rawBody);

    console.info('Zoho OAuth token response', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      redirected: response.redirected,
      redirectChain,
      headers: Object.fromEntries(response.headers.entries()),
      body: rawBody
    });

    if (!response.ok || payload.error) {
      throw new ZohoOAuthTokenError(
        `Zoho OAuth token request failed (${response.status}). ${this.describeTokenError(payload)}`,
        response.status,
        payload,
        rawBody
      );
    }

    return payload;
  }

  private assertClientConfig(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('CATALYST_CLIENT_ID and CATALYST_CLIENT_SECRET are required for Zoho OAuth.');
    }
  }

  private describeTokenError(payload: Partial<ZohoTokenResponse>): string {
    return [payload.error, payload.error_description].filter(Boolean).join(': ');
  }

  private parseTokenResponse(rawBody: string): ZohoTokenResponse {
    if (!rawBody) return {} as ZohoTokenResponse;

    try {
      return JSON.parse(rawBody) as ZohoTokenResponse;
    } catch {
      return { error: rawBody } as ZohoTokenResponse;
    }
  }

  private async fetchWithRedirectAudit(
    url: URL,
    init: RequestInit,
    maxRedirects = 5
  ): Promise<{ response: Response; redirectChain: Array<{ status: number; from: string; location: string | null }> }> {
    const redirectChain: Array<{ status: number; from: string; location: string | null }> = [];
    let currentUrl = url.toString();

    for (let redirects = 0; redirects <= maxRedirects; redirects++) {
      const response = await fetch(currentUrl, {
        ...init,
        redirect: 'manual'
      });

      if (response.status < 300 || response.status >= 400) {
        return { response, redirectChain };
      }

      const location = response.headers.get('location');
      redirectChain.push({ status: response.status, from: currentUrl, location });

      if (!location) {
        return { response, redirectChain };
      }

      currentUrl = new URL(location, currentUrl).toString();
    }

    throw new Error(`Zoho OAuth token request exceeded ${maxRedirects} redirects.`);
  }

  private findDuplicateKeys(params: URLSearchParams): string[] {
    const counts = new Map<string, number>();
    for (const key of params.keys()) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
  }

  private inspectEnvValue(value: string | undefined, secret = false): Record<string, unknown> {
    const raw = value ?? '';
    return {
      present: raw.length > 0,
      value: secret ? undefined : raw,
      length: raw.length,
      leadingWhitespace: raw.length !== raw.trimStart().length,
      trailingWhitespace: raw.length !== raw.trimEnd().length,
      wrappedInQuotes: /^['"].*['"]$/.test(raw),
      wrappedInAngleBrackets: /^<.*>$/.test(raw),
      containsPlaceholderText: /your|actual|client secret|placeholder/i.test(raw),
      containsCrLf: /[\r\n]/.test(raw),
      containsOtherHiddenWhitespace: /[\t\f\v]/.test(raw)
    };
  }
}

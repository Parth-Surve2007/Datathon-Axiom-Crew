import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { aiAuthMiddleware } from '../middleware/ai-auth.middleware';
import { AIOrchestrator } from '../ai/orchestrator/AIOrchestrator';
import { ProviderFactory } from '../ai/providers/ProviderFactory';
import { ToolRegistry } from '../ai/tools/ToolRegistry';
import { ConversationMemory } from '../ai/memory/ConversationMemory';
import { InMemoryConversationRepository } from '../ai/memory/InMemoryConversationRepository';
import { CompositeRetriever } from '../ai/retrieval/CompositeRetriever';
import { ZohoOAuthTokenError, ZohoOAuthTokenManager } from '../ai/providers/ZohoOAuthTokenManager';
import { appConfig } from '../config';

// ─── Provider ──────────────────────────────────────────────────────────────────
// Uses CatalystQuickMLProvider when env vars are present.
// Falls back to a descriptive error provider to expose misconfiguration clearly.
const catalystEnvPresent =
  !!process.env.CATALYST_ORG_ID &&
  !!(process.env.CATALYST_QUICKML_ENDPOINT_URL || process.env.CATALYST_QUICKML_DEPLOYMENT_URL) &&
  !!process.env.CATALYST_CLIENT_ID &&
  !!process.env.CATALYST_CLIENT_SECRET &&
  !!(process.env.ZOHO_REFRESH_TOKEN || process.env.CATALYST_REFRESH_TOKEN);

const provider = catalystEnvPresent
  ? ProviderFactory.create('catalyst', {
      model: process.env.CATALYST_MODEL_ID || 'quickml-default-model',
    })
  : {
      generate: async (_req: any) => ({
        text: `[Configuration Error] The Catalyst AI provider is not configured. Set CATALYST_ORG_ID, CATALYST_QUICKML_ENDPOINT_URL, CATALYST_CLIENT_ID, CATALYST_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN in your .env file to enable real AI responses.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      }),
      generateStream: async function* () {
        yield '[Configuration Error] Catalyst env vars missing.';
      },
    } as any;

// ─── Retriever ────────────────────────────────────────────────────────────────
// CompositeRetriever with no sub-retrievers returns [] gracefully.
const retriever = new CompositeRetriever([]);

// ─── Tool Registry ────────────────────────────────────────────────────────────
const toolRegistry = new ToolRegistry();

// ─── Memory ───────────────────────────────────────────────────────────────────
// Uses an in-memory store for development (no DB required).
const memory = new ConversationMemory(new InMemoryConversationRepository());

// ─── Orchestrator ─────────────────────────────────────────────────────────────
const orchestrator = new AIOrchestrator(provider, retriever, toolRegistry, memory);
const aiController = new AIController(orchestrator);

const router = Router();
const oauthTokenManager = new ZohoOAuthTokenManager();

const requireOAuthSetupSecret = (req: any, res: any, next: any) => {
  const expected = process.env.CATALYST_OAUTH_SETUP_SECRET;
  if (!expected) {
    res.status(403).json({ ok: false, error: 'CATALYST_OAUTH_SETUP_SECRET is not configured.' });
    return;
  }

  if (req.header('X-Catalyst-OAuth-Setup-Secret') !== expected) {
    res.status(401).json({ ok: false, error: 'Invalid OAuth setup secret.' });
    return;
  }

  next();
};

router.get('/oauth/authorize-url', requireOAuthSetupSecret, (_req, res, next) => {
  try {
    res.json({
      ok: true,
      data: {
        authorizationUrl: oauthTokenManager.buildAuthorizationUrl(),
        tokenEndpoint: `${process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in'}/oauth/v2/token`,
        scope: 'QuickML.deployment.READ'
      }
    });
  } catch (error) {
    if (error instanceof ZohoOAuthTokenError) {
      console.error('Zoho OAuth token exchange failed', {
        status: error.status,
        payload: error.payload,
        rawBody: error.rawBody
      });

      res.status(error.status || 400).json({
        ok: false,
        error: 'ZOHO_OAUTH_TOKEN_EXCHANGE_FAILED',
        message: error.message,
        zoho: appConfig.isDev ? error.payload : undefined
      });
      return;
    }

    next(error);
  }
});

router.post('/oauth/exchange', requireOAuthSetupSecret, async (req, res, next) => {
  try {
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    if (!code) {
      res.status(400).json({ ok: false, error: 'code is required' });
      return;
    }

    const token = await oauthTokenManager.exchangeAuthorizationCode(code);
    res.json({
      ok: true,
      data: {
        accessTokenReceived: !!token.access_token,
        refreshTokenReceived: !!token.refresh_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        apiDomain: token.api_domain,
        tokenType: token.token_type
      }
    });
  } catch (error) {
    next(error);
  }
});

// Apply AI-specific authentication and rate limiting
router.use(aiAuthMiddleware);

router.post('/chat', aiController.chat);
router.post('/chat/stream', aiController.streamChat);
router.get('/chat/history', aiController.getHistory);
router.delete('/chat/history', aiController.deleteHistory);
router.post('/chat/export', aiController.exportChat);
router.post('/chat/feedback', aiController.submitFeedback);

export default router;

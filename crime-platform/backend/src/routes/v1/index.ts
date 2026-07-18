import { Router } from 'express';

/**
 * API v1 router.
 * Mount all versioned routes here.
 */
const v1Router = Router();

// ─── Placeholder Route Groups ──────────────────────────────────────────────────
// These will be wired in as their respective modules are implemented:
//
// import authRoutes from './auth.routes';
// import firRoutes from './fir.routes';
// import suspectRoutes from './suspect.routes';
// import analyticsRoutes from './analytics.routes';
// import chatRoutes from './chat.routes';
// import graphRoutes from './graph.routes';
// import reportRoutes from './report.routes';
//
// v1Router.use('/auth', authRateLimiter, authRoutes);
// v1Router.use('/firs', firRoutes);
// v1Router.use('/suspects', suspectRoutes);
// v1Router.use('/analytics', analyticsRoutes);
// v1Router.use('/chat', chatRoutes);
// v1Router.use('/graph', graphRoutes);
// v1Router.use('/reports', reportRoutes);

export default v1Router;

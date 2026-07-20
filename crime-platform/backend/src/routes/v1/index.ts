import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import employeeRoutes from './employee.routes';
import stationRoutes from './station.routes';
import districtRoutes from './district.routes';

/**
 * API v1 router.
 * Mount all versioned routes here.
 */
const v1Router = Router();

// ─── Module 1: Core System & Auth ──────────────────────────────────────────────
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/roles', roleRoutes);
v1Router.use('/employees', employeeRoutes);
v1Router.use('/stations', stationRoutes);
v1Router.use('/districts', districtRoutes);

// ─── Placeholder Route Groups ──────────────────────────────────────────────────
// These will be wired in as their respective modules are implemented:
//
// import firRoutes from './fir.routes';
// import suspectRoutes from './suspect.routes';
// import analyticsRoutes from './analytics.routes';
// import chatRoutes from './chat.routes';
// import graphRoutes from './graph.routes';
// import reportRoutes from './report.routes';
//
// v1Router.use('/firs', firRoutes);
// v1Router.use('/suspects', suspectRoutes);
// v1Router.use('/analytics', analyticsRoutes);
// v1Router.use('/chat', chatRoutes);
// v1Router.use('/graph', graphRoutes);
// v1Router.use('/reports', reportRoutes);

export default v1Router;

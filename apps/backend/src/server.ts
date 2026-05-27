import express from 'express';
import cors from 'cors';
import { Container } from './container';
import { config } from './config';
import { errorHandler } from './http/middlewares/error-handler';
import { makeAuthMiddleware, requireAuth } from './http/middlewares/auth-middleware';
import { makeAuthController } from './http/controllers/auth-controller';
import { makeProductsController } from './http/controllers/products-controller';
import { makeCartController } from './http/controllers/cart-controller';
import { makeOrdersController } from './http/controllers/orders-controller';

export const buildServer = (container: Container): express.Express => {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const attachUser = makeAuthMiddleware(container.services.tokens, container.repositories.users);

  // Auth (public + /me protected)
  const authRouter = makeAuthController(container.useCases.register, container.useCases.login);
  app.use('/api/auth', (req, res, next) => {
    if (req.path === '/me') {
      attachUser(req, res, () => requireAuth(req, res, next));
      return;
    }
    next();
  }, authRouter);

  // Products: list/get public; mutations require auth (use case enforces ADMIN)
  app.use(
    '/api/products',
    (req, res, next) => {
      const isMutation = ['POST', 'PATCH', 'DELETE'].includes(req.method);
      if (!isMutation) return next();
      attachUser(req, res, err => (err ? next(err) : requireAuth(req, res, next)));
    },
    makeProductsController({
      list: container.useCases.listProducts,
      get: container.useCases.getProduct,
      create: container.useCases.createProduct,
      update: container.useCases.updateProduct,
      remove: container.useCases.deleteProduct
    })
  );

  // Cart & Orders: always require auth
  app.use(
    '/api/cart',
    attachUser,
    requireAuth,
    makeCartController({
      get: container.useCases.getCart,
      add: container.useCases.addToCart,
      update: container.useCases.updateCartItem,
      remove: container.useCases.removeFromCart,
      clear: container.useCases.clearCart
    })
  );

  app.use(
    '/api/orders',
    attachUser,
    requireAuth,
    makeOrdersController({
      checkout: container.useCases.checkout,
      list: container.useCases.listOrders,
      get: container.useCases.getOrder,
      updateStatus: container.useCases.updateOrderStatus,
      cancel: container.useCases.cancelOrder
    })
  );

  app.use(errorHandler);
  return app;
};

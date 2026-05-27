import { NextFunction, Request, Response, Router } from 'express';
import {
  CancelOrderUseCase,
  CheckoutUseCase,
  GetOrderUseCase,
  ListOrdersUseCase,
  OrderStatus,
  UpdateOrderStatusUseCase
} from '@food-orders/domain';
import { presentOrder } from '../presenters';

export const makeOrdersController = (deps: {
  checkout: CheckoutUseCase;
  list: ListOrdersUseCase;
  get: GetOrderUseCase;
  updateStatus: UpdateOrderStatusUseCase;
  cancel: CancelOrderUseCase;
}): Router => {
  const router = Router();

  router.post('/checkout', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await deps.checkout.execute(req.user!);
      res.status(201).json({ order: presentOrder(order) });
    } catch (e) { next(e); }
  });

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await deps.list.execute(req.user!, {
        status: req.query.status as OrderStatus | undefined
      });
      res.json({ orders: orders.map(presentOrder) });
    } catch (e) { next(e); }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await deps.get.execute(req.user!, req.params.id);
      res.json({ order: presentOrder(order) });
    } catch (e) { next(e); }
  });

  router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await deps.updateStatus.execute(req.user!, {
        orderId: req.params.id,
        nextStatus: req.body.status
      });
      res.json({ order: presentOrder(order) });
    } catch (e) { next(e); }
  });

  router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await deps.cancel.execute(req.user!, req.params.id);
      res.json({ order: presentOrder(order) });
    } catch (e) { next(e); }
  });

  return router;
};

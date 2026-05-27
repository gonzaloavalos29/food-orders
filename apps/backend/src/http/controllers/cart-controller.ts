import { NextFunction, Request, Response, Router } from 'express';
import {
  AddToCartUseCase,
  ClearCartUseCase,
  GetCartUseCase,
  RemoveFromCartUseCase,
  UpdateCartItemQuantityUseCase
} from '@food-orders/domain';
import { presentCart } from '../presenters';

export const makeCartController = (deps: {
  get: GetCartUseCase;
  add: AddToCartUseCase;
  update: UpdateCartItemQuantityUseCase;
  remove: RemoveFromCartUseCase;
  clear: ClearCartUseCase;
}): Router => {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await deps.get.execute(req.user!);
      res.json({ cart: presentCart(cart) });
    } catch (e) { next(e); }
  });

  router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await deps.add.execute(req.user!, {
        productId: req.body.productId,
        quantity: req.body.quantity
      });
      res.json({ cart: presentCart(cart) });
    } catch (e) { next(e); }
  });

  router.patch('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await deps.update.execute(req.user!, {
        productId: req.params.productId,
        quantity: req.body.quantity
      });
      res.json({ cart: presentCart(cart) });
    } catch (e) { next(e); }
  });

  router.delete('/items/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await deps.remove.execute(req.user!, req.params.productId);
      res.json({ cart: presentCart(cart) });
    } catch (e) { next(e); }
  });

  router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await deps.clear.execute(req.user!);
      res.json({ cart: presentCart(cart) });
    } catch (e) { next(e); }
  });

  return router;
};

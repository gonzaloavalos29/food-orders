import { NextFunction, Request, Response, Router } from 'express';
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  ProductCategory,
  UpdateProductUseCase
} from '@food-orders/domain';
import { presentProduct } from '../presenters';

export const makeProductsController = (deps: {
  list: ListProductsUseCase;
  get: GetProductUseCase;
  create: CreateProductUseCase;
  update: UpdateProductUseCase;
  remove: DeleteProductUseCase;
}): Router => {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await deps.list.execute(req.user ?? null, {
        category: req.query.category as ProductCategory | undefined,
        includeUnavailable: req.query.includeUnavailable === 'true'
      });
      res.json({ products: products.map(presentProduct) });
    } catch (e) { next(e); }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await deps.get.execute(req.params.id);
      res.json({ product: presentProduct(product) });
    } catch (e) { next(e); }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await deps.create.execute(req.user!, {
        name: req.body.name,
        description: req.body.description ?? '',
        priceInCents: req.body.priceInCents,
        category: req.body.category,
        available: req.body.available ?? true
      });
      res.status(201).json({ product: presentProduct(product) });
    } catch (e) { next(e); }
  });

  router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await deps.update.execute(req.user!, {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        priceInCents: req.body.priceInCents,
        category: req.body.category,
        available: req.body.available
      });
      res.json({ product: presentProduct(product) });
    } catch (e) { next(e); }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deps.remove.execute(req.user!, req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  });

  return router;
};

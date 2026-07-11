import { NextFunction, Request, Response, Router } from 'express';
import { LoginUserUseCase, RegisterUserUseCase } from '@food-orders/domain';
import { presentUser } from '../presenters';

export const makeAuthController = (
  registerUseCase: RegisterUserUseCase,
  loginUseCase: LoginUserUseCase
): Router => {
  const router = Router();

  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await registerUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role
      });
      res.status(201).json({ user: presentUser(user) });
    } catch (e) { next(e); }
  });

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await loginUseCase.execute({
        email: req.body.email,
        password: req.body.password
      });
      res.json({ user: presentUser(user), token });
    } catch (e) { next(e); }
  });

  router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new Error('unauthenticated');
      res.json({ user: presentUser(req.user) });
    } catch (e) { next(e); }
  });

  return router;
};

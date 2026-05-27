import {
  AddToCartUseCase,
  CancelOrderUseCase,
  CheckoutUseCase,
  ClearCartUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetCartUseCase,
  GetOrderUseCase,
  GetProductUseCase,
  ListOrdersUseCase,
  ListProductsUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  RemoveFromCartUseCase,
  SystemClock,
  UpdateCartItemQuantityUseCase,
  UpdateOrderStatusUseCase,
  UpdateProductUseCase
} from '@food-orders/domain';
import { config } from './config';
import { prisma } from './infrastructure/prisma-client';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user-repository';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product-repository';
import { PrismaCartRepository } from './infrastructure/repositories/prisma-cart-repository';
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order-repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/services/jwt-token-service';
import { UuidIdGenerator } from './infrastructure/services/uuid-id-generator';

export const buildContainer = () => {
  const users = new PrismaUserRepository(prisma);
  const products = new PrismaProductRepository(prisma);
  const carts = new PrismaCartRepository(prisma);
  const orders = new PrismaOrderRepository(prisma);

  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(config.jwtSecret, config.jwtExpiresIn);
  const ids = new UuidIdGenerator();
  const clock = new SystemClock();

  return {
    repositories: { users, products, carts, orders },
    services: { hasher, tokens, ids, clock },
    useCases: {
      register: new RegisterUserUseCase(users, hasher, ids, clock),
      login: new LoginUserUseCase(users, hasher, tokens),
      createProduct: new CreateProductUseCase(products, ids, clock),
      updateProduct: new UpdateProductUseCase(products),
      deleteProduct: new DeleteProductUseCase(products),
      listProducts: new ListProductsUseCase(products),
      getProduct: new GetProductUseCase(products),
      addToCart: new AddToCartUseCase(carts, products),
      removeFromCart: new RemoveFromCartUseCase(carts),
      updateCartItem: new UpdateCartItemQuantityUseCase(carts),
      getCart: new GetCartUseCase(carts),
      clearCart: new ClearCartUseCase(carts),
      checkout: new CheckoutUseCase(carts, orders, products, ids, clock),
      listOrders: new ListOrdersUseCase(orders),
      getOrder: new GetOrderUseCase(orders),
      updateOrderStatus: new UpdateOrderStatusUseCase(orders),
      cancelOrder: new CancelOrderUseCase(orders)
    }
  };
};

export type Container = ReturnType<typeof buildContainer>;

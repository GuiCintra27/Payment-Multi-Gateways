/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const ClientsController = () => import('#controllers/clients_controller')
const GatewaysController = () => import('#controllers/gateways_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const PurchasesController = () => import('#controllers/purchases_controller')
const RefundsController = () => import('#controllers/refunds_controller')

/**
 * Health check
 */
router.get('/', () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

/**
 * Auth routes (public)
 */
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

/**
 * Purchases route (public)
 */
router.post('/purchases', [PurchasesController, 'store'])

/**
 * Authenticated routes
 */
router
  .group(() => {
    /**
     * Users CRUD — ADMIN, MANAGER
     */
    router
      .group(() => {
        router.get('/', [UsersController, 'index'])
        router.post('/', [UsersController, 'store'])
        router.get('/:id', [UsersController, 'show'])
        router.put('/:id', [UsersController, 'update'])
        router.delete('/:id', [UsersController, 'destroy'])
      })
      .prefix('/users')
      .use(middleware.role({ roles: ['ADMIN', 'MANAGER'] }))

    /**
     * Products CRUD — ADMIN, MANAGER, FINANCE
     */
    router
      .group(() => {
        router.get('/', [ProductsController, 'index'])
        router.post('/', [ProductsController, 'store'])
        router.get('/:id', [ProductsController, 'show'])
        router.put('/:id', [ProductsController, 'update'])
        router.delete('/:id', [ProductsController, 'destroy'])
      })
      .prefix('/products')
      .use(middleware.role({ roles: ['ADMIN', 'MANAGER', 'FINANCE'] }))

    /**
     * Clients (read-only) — all authenticated users
     */
    router
      .group(() => {
        router.get('/', [ClientsController, 'index'])
        router.get('/:id', [ClientsController, 'show'])
      })
      .prefix('/clients')

    /**
     * Gateways management — ADMIN only
     */
    router
      .group(() => {
        router.get('/', [GatewaysController, 'index'])
        router.patch('/:id/toggle', [GatewaysController, 'toggle'])
        router.patch('/:id/priority', [GatewaysController, 'priority'])
      })
      .prefix('/gateways')
      .use(middleware.role({ roles: ['ADMIN'] }))

    /**
     * Transactions (read-only) — all authenticated roles
     */
    router
      .group(() => {
        router.get('/', [TransactionsController, 'index'])
        router.get('/:id', [TransactionsController, 'show'])
      })
      .prefix('/transactions')
      .use(middleware.role({ roles: ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] }))

    /**
     * Refund — ADMIN, FINANCE
     */
    router
      .post('/transactions/:id/refund', [RefundsController, 'store'])
      .use(middleware.role({ roles: ['ADMIN', 'FINANCE'] }))
  })
  .use(middleware.auth())

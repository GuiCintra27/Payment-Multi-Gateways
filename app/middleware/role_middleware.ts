import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * RBAC Middleware — restricts access based on user roles.
 *
 * Usage in routes:
 * ```ts
 * router.get('/admin', [Controller, 'method']).use(middleware.role(['ADMIN']))
 * ```
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    const user = ctx.auth.getUserOrFail()

    if (!options.roles.includes(user.role)) {
      return ctx.response.forbidden({
        message: 'You do not have permission to access this resource',
      })
    }

    return next()
  }
}

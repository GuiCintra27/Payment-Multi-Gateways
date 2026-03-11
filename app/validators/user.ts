import vine from '@vinejs/vine'

/**
 * Shared rules
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Login validator
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Create user (admin action)
 */
export const createUserValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER']),
})

/**
 * Update user (admin action)
 */
export const updateUserValidator = vine.create({
  fullName: vine.string().nullable().optional(),
  email: vine.string().email().maxLength(254).optional(),
  password: password().optional(),
  role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER']).optional(),
})

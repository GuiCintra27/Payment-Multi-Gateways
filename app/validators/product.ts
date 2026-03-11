import vine from '@vinejs/vine'

/**
 * Create product
 */
export const createProductValidator = vine.create({
  name: vine.string().maxLength(255),
  amount: vine.number().positive().withoutDecimals(),
})

/**
 * Update product
 */
export const updateProductValidator = vine.create({
  name: vine.string().maxLength(255).optional(),
  amount: vine.number().positive().withoutDecimals().optional(),
})

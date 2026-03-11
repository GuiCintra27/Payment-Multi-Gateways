import vine from '@vinejs/vine'

/**
 * Gateway management validators
 */
export const toggleGatewayValidator = vine.create({
  isActive: vine.boolean(),
})

export const updateGatewayPriorityValidator = vine.create({
  priority: vine.number().positive().withoutDecimals(),
})

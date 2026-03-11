import vine from '@vinejs/vine'

/**
 * Purchase validator — public endpoint for making purchases
 */
export const purchaseValidator = vine.create({
  client: vine.object({
    name: vine.string().maxLength(255),
    email: vine.string().email().maxLength(254),
  }),
  products: vine
    .array(
      vine.object({
        id: vine.number().positive().withoutDecimals(),
        quantity: vine.number().positive().withoutDecimals(),
      })
    )
    .minLength(1),
  card: vine.object({
    number: vine.string().minLength(13).maxLength(19),
    cvv: vine.string().minLength(3).maxLength(4),
    holderName: vine.string().maxLength(255),
    expirationDate: vine.string(),
  }),
})

import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  /**
   * GET /products — list all products
   */
  async index({}: HttpContext) {
    return Product.query().orderBy('id', 'asc')
  }

  /**
   * POST /products — create a new product
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createProductValidator)
    const product = await Product.create(data)

    return response.created(product)
  }

  /**
   * GET /products/:id — show a single product
   */
  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    return product
  }

  /**
   * PUT /products/:id — update a product
   */
  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    const data = await request.validateUsing(updateProductValidator)
    product.merge(data)
    await product.save()

    return product
  }

  /**
   * DELETE /products/:id — remove a product
   */
  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    await product.delete()
    return response.noContent()
  }
}

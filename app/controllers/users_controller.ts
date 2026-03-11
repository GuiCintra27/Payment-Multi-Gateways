import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  /**
   * GET /users — list all users
   */
  async index({}: HttpContext) {
    const users = await User.query().orderBy('id', 'asc')
    return users.map(UserTransformer.transform)
  }

  /**
   * POST /users — create a new user (admin)
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    const user = await User.create(data)

    return response.created(UserTransformer.transform(user))
  }

  /**
   * GET /users/:id — show a single user
   */
  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    return UserTransformer.transform(user)
  }

  /**
   * PUT /users/:id — update a user
   */
  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const data = await request.validateUsing(updateUserValidator)
    user.merge(data)
    await user.save()

    return UserTransformer.transform(user)
  }

  /**
   * DELETE /users/:id — soft-delete or remove a user
   */
  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    await user.delete()
    return response.noContent()
  }
}

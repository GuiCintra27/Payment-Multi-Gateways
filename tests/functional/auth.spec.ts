import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /login returns token with valid credentials', async ({ client, assert }) => {
    await User.create({
      fullName: 'Test User',
      email: 'auth-test@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.post('/login').json({
      email: 'auth-test@test.com',
      password: 'password123',
    })

    response.assertStatus(200)
    assert.isDefined(response.body().token)
    assert.equal(response.body().user.email, 'auth-test@test.com')
  })

  test('POST /login returns 400 with invalid credentials', async ({ client }) => {
    await User.create({
      fullName: 'Test User',
      email: 'auth-test2@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.post('/login').json({
      email: 'auth-test2@test.com',
      password: 'wrong-password',
    })

    response.assertStatus(400)
  })

  test('POST /logout revokes token', async ({ client }) => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'auth-logout@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.post('/logout').loginAs(user)
    response.assertStatus(200)
  })

  test('protected routes return 401 without token', async ({ client }) => {
    const response = await client.get('/users')
    response.assertStatus(401)
  })
})

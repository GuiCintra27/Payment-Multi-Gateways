import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Product from '#models/product'

test.group('Products CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /products returns list of products', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'prod-admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    await Product.create({ name: 'Test Product', amount: 5000 })

    const response = await client.get('/products').loginAs(admin)
    response.assertStatus(200)
    assert.isArray(response.body())
    assert.isAbove(response.body().length, 0)
  })

  test('POST /products creates a product', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'prod-create@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.post('/products').loginAs(admin).json({
      name: 'New Product',
      amount: 9990,
    })

    response.assertStatus(201)
    assert.equal(response.body().name, 'New Product')
    assert.equal(response.body().amount, 9990)
  })

  test('POST /products rejects negative amount', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'prod-neg@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.post('/products').loginAs(admin).json({
      name: 'Bad Product',
      amount: -100,
    })

    response.assertStatus(422)
  })

  test('POST /products rejects decimal amount', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'prod-decimal@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.post('/products').loginAs(admin).json({
      name: 'Decimal Product',
      amount: 99.5,
    })

    response.assertStatus(422)
  })

  test('FINANCE can access /products', async ({ client }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'prod-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const response = await client.get('/products').loginAs(finance)
    response.assertStatus(200)
  })

  test('USER cannot access /products', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'prod-user@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.get('/products').loginAs(user)
    response.assertStatus(403)
  })
})

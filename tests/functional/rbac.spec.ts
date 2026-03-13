import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('RBAC', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('ADMIN can access /users', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'rbac-admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.get('/users').loginAs(admin)
    response.assertStatus(200)
  })

  test('MANAGER can access /users', async ({ client }) => {
    const manager = await User.create({
      fullName: 'Manager',
      email: 'rbac-manager@test.com',
      password: 'password123',
      role: 'MANAGER',
    })

    const response = await client.get('/users').loginAs(manager)
    response.assertStatus(200)
  })

  test('FINANCE cannot access /users', async ({ client }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'rbac-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const response = await client.get('/users').loginAs(finance)
    response.assertStatus(403)
  })

  test('USER cannot access /users', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'rbac-user@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.get('/users').loginAs(user)
    response.assertStatus(403)
  })

  test('ADMIN can access /gateways', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'rbac-gw-admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.get('/gateways').loginAs(admin)
    response.assertStatus(200)
  })

  test('FINANCE cannot access /gateways', async ({ client }) => {
    const finance = await User.create({
      fullName: 'Finance',
      email: 'rbac-gw-finance@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    const response = await client.get('/gateways').loginAs(finance)
    response.assertStatus(403)
  })

  test('ADMIN, MANAGER and FINANCE can access /clients', async ({ client }) => {
    for (const role of ['ADMIN', 'MANAGER', 'FINANCE'] as const) {
      const user = await User.create({
        fullName: `${role} User`,
        email: `rbac-clients-${role.toLowerCase()}@test.com`,
        password: 'password123',
        role,
      })

      const response = await client.get('/clients').loginAs(user)
      response.assertStatus(200)
    }
  })

  test('USER cannot access /clients', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'rbac-user-clients@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.get('/clients').loginAs(user)
    response.assertStatus(403)
  })
})

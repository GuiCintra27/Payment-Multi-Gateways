import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Users CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /users returns list of users', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.get('/users').loginAs(admin)
    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('POST /users creates a new user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin-create@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.post('/users').loginAs(admin).json({
      fullName: 'New User',
      email: 'new-user@test.com',
      password: 'password123',
      role: 'FINANCE',
    })

    response.assertStatus(201)
    assert.equal(response.body().email, 'new-user@test.com')
    assert.equal(response.body().role, 'FINANCE')
  })

  test('GET /users/:id returns a user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin-show@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.get(`/users/${admin.id}`).loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().email, 'crud-admin-show@test.com')
  })

  test('PUT /users/:id updates a user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin-update@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const target = await User.create({
      fullName: 'Target',
      email: 'target-update@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.put(`/users/${target.id}`).loginAs(admin).json({
      role: 'MANAGER',
    })

    response.assertStatus(200)
    assert.equal(response.body().role, 'MANAGER')
  })

  test('DELETE /users/:id removes a user', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin-delete@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const target = await User.create({
      fullName: 'Target',
      email: 'target-delete@test.com',
      password: 'password123',
      role: 'USER',
    })

    const response = await client.delete(`/users/${target.id}`).loginAs(admin)
    response.assertStatus(204)
  })

  test('GET /users/:id returns 404 for non-existent user', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'crud-admin-404@test.com',
      password: 'password123',
      role: 'ADMIN',
    })

    const response = await client.get('/users/99999').loginAs(admin)
    response.assertStatus(404)
  })
})

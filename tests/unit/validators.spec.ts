import { test } from '@japa/runner'
import { createUserValidator, updateUserValidator, loginValidator } from '#validators/user'

test.group('User Validators', () => {
  test('loginValidator accepts valid credentials', async ({ assert }) => {
    const data = { email: 'test@test.com', password: 'any-password' }
    const result = await loginValidator.validate(data)
    assert.equal(result.email, 'test@test.com')
  })

  test('loginValidator rejects invalid email', async ({ assert }) => {
    const data = { email: 'not-an-email', password: 'any-password' }
    try {
      await loginValidator.validate(data)
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.isDefined(error)
    }
  })

  test('createUserValidator rejects invalid role', async ({ assert }) => {
    const data = {
      fullName: 'Test User',
      email: 'new@test.com',
      password: 'password123',
      role: 'SUPERUSER',
    }
    try {
      await createUserValidator.validate(data)
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.isDefined(error)
    }
  })

  test('createUserValidator accepts valid roles', async ({ assert }) => {
    for (const role of ['ADMIN', 'MANAGER', 'FINANCE', 'USER']) {
      const data = {
        fullName: 'Test User',
        email: `${role.toLowerCase()}@test.com`,
        password: 'password123',
        role,
      }
      const result = await createUserValidator.validate(data)
      assert.equal(result.role, role)
    }
  })

  test('updateUserValidator allows partial updates', async ({ assert }) => {
    const data = { role: 'FINANCE' }
    const result = await updateUserValidator.validate(data)
    assert.equal(result.role, 'FINANCE')
    assert.isUndefined(result.fullName)
  })
})

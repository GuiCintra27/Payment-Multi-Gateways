import { test } from '@japa/runner'
import { purchaseValidator } from '#validators/purchase'

test.group('Purchase Validator', () => {
  test('accepts valid purchase data', async ({ assert }) => {
    const data = {
      client: { name: 'John Doe', email: 'john@test.com' },
      products: [
        { id: 1, quantity: 2 },
        { id: 2, quantity: 1 },
      ],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'JOHN DOE',
        expirationDate: '12/2030',
      },
    }

    const result = await purchaseValidator.validate(data)
    assert.equal(result.client.email, 'john@test.com')
    assert.lengthOf(result.products, 2)
    assert.equal(result.products[0].quantity, 2)
  })

  test('rejects empty products array', async ({ assert }) => {
    const data = {
      client: { name: 'John Doe', email: 'john@test.com' },
      products: [],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'JOHN DOE',
        expirationDate: '12/2030',
      },
    }

    try {
      await purchaseValidator.validate(data)
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.isDefined(error)
    }
  })

  test('rejects missing client email', async ({ assert }) => {
    const data = {
      client: { name: 'John Doe' },
      products: [{ id: 1, quantity: 1 }],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'JOHN DOE',
        expirationDate: '12/2030',
      },
    }

    try {
      await purchaseValidator.validate(data)
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.isDefined(error)
    }
  })

  test('rejects negative quantity', async ({ assert }) => {
    const data = {
      client: { name: 'John Doe', email: 'john@test.com' },
      products: [{ id: 1, quantity: -1 }],
      card: {
        number: '4111111111111111',
        cvv: '123',
        holderName: 'JOHN DOE',
        expirationDate: '12/2030',
      },
    }

    try {
      await purchaseValidator.validate(data)
      assert.fail('Should have thrown validation error')
    } catch (error) {
      assert.isDefined(error)
    }
  })
})

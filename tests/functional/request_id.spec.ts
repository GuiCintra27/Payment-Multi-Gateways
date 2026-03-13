import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Request ID', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('generates an X-Request-Id header when the client does not provide one', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    assert.isString(response.header('X-Request-Id'))
  })

  test('echoes the provided X-Request-Id header', async ({ client }) => {
    const response = await client.get('/').header('X-Request-Id', 'req-health-1')

    response.assertStatus(200)
    response.assertHeader('X-Request-Id', 'req-health-1')
  })
})

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'admin@betalent.tech' },
      {
        fullName: 'Admin BeTalent',
        email: 'admin@betalent.tech',
        password: 'admin123',
        role: 'ADMIN',
      }
    )
  }
}

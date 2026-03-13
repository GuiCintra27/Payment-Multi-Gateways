/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  metrics: {
    index: typeof routes['metrics.index']
  }
  auth: {
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
  }
  purchases: {
    store: typeof routes['purchases.store']
  }
  users: {
    index: typeof routes['users.index']
    store: typeof routes['users.store']
    show: typeof routes['users.show']
    update: typeof routes['users.update']
    destroy: typeof routes['users.destroy']
  }
  products: {
    index: typeof routes['products.index']
    store: typeof routes['products.store']
    show: typeof routes['products.show']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  clients: {
    index: typeof routes['clients.index']
    show: typeof routes['clients.show']
  }
  gateways: {
    index: typeof routes['gateways.index']
    toggle: typeof routes['gateways.toggle']
    priority: typeof routes['gateways.priority']
  }
  transactions: {
    index: typeof routes['transactions.index']
    show: typeof routes['transactions.show']
  }
  refunds: {
    store: typeof routes['refunds.store']
  }
}

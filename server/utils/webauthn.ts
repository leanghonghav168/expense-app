import type { H3Event } from 'h3'

export function getWebAuthnConfig(event: H3Event) {
  const host = getRequestHost(event)
  const hostname = host.split(':')[0]
  const protocol = getRequestProtocol(event)
  const expectedOrigin = `${protocol}://${host}`

  return {
    rpName: 'Expense Tracker',
    rpID: hostname,
    expectedOrigin
  }
}


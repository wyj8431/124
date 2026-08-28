import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const apiSource = await readFile(new URL('../src/api/index.ts', import.meta.url), 'utf8')
const membersSource = await readFile(new URL('../src/pages/EnterpriseMembersPage.tsx', import.meta.url), 'utf8')
const ticketsSource = await readFile(new URL('../src/pages/SupportTicketPage.tsx', import.meta.url), 'utf8')

test('registers enterprise members and support ticket routes', () => {
  assert.match(appSource, /EnterpriseMembersPage/)
  assert.match(appSource, /SupportTicketPage/)
  assert.match(appSource, /\/designtools\/enterprise\/members/)
  assert.match(appSource, /\/support\/tickets/)
})

test('exposes team management and support ticket API operations', () => {
  assert.match(apiSource, /export const teamApi/)
  assert.match(apiSource, /updateRole:/)
  assert.match(apiSource, /removeMember:/)
  assert.match(apiSource, /export const supportTicketApi/)
  assert.match(apiSource, /create:/)
})

test('members page loads members and supports role changes and removal', () => {
  assert.match(membersSource, /teamApi\.getCurrent/)
  assert.match(membersSource, /teamApi\.updateRole/)
  assert.match(membersSource, /teamApi\.removeMember/)
})

test('support ticket page loads tickets and creates a ticket', () => {
  assert.match(ticketsSource, /supportTicketApi\.list/)
  assert.match(ticketsSource, /supportTicketApi\.create/)
})

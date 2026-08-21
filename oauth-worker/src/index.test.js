import test from 'node:test'
import assert from 'node:assert/strict'
import { handleRequest, renderCallbackPage } from './index.js'

test('GET /auth redirects to GitHub authorize', async () => {
  const env = { GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'sec' }
  const req = new Request('https://oauth.example/auth')
  const res = await handleRequest(req, env)
  assert.equal(res.status, 302)
  const loc = res.headers.get('Location')
  assert.match(loc, /github\.com\/login\/oauth\/authorize/)
  assert.match(loc, /client_id=cid/)
  assert.match(loc, /redirect_uri=.*callback/)
})

test('callback page posts authorization message shape Decap expects', () => {
  const html = renderCallbackPage('gho_testtoken')
  assert.match(html, /authorization:github:success:/)
  assert.match(html, /gho_testtoken/)
  assert.match(html, /window\.opener\.postMessage/)
})

test('GET / unknown returns 404', async () => {
  const env = { GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'sec' }
  const res = await handleRequest(new Request('https://oauth.example/'), env)
  assert.equal(res.status, 404)
})

test('GET /callback exchanges code and renders token page', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ access_token: 'gho_x' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  try {
    const env = { GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'sec' }
    const res = await handleRequest(
      new Request('https://oauth.example/callback?code=abc'),
      env
    )
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.match(html, /gho_x/)
    assert.match(html, /authorization:github:success:/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

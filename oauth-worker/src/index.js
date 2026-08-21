export function renderCallbackPage(token) {
  const payload = JSON.stringify({ token, provider: 'github' })
  const msg = `authorization:github:success:${payload}`
  return `<!DOCTYPE html>
<html><body><script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`
}

export function renderErrorPage(error) {
  const msg = `authorization:github:error:${JSON.stringify(error)}`
  return `<!DOCTYPE html>
<html><body><script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`
}

export async function handleRequest(request, env) {
  const url = new URL(request.url)

  if (url.pathname === '/auth') {
    const redirectUri = `${url.origin}/callback`
    const authorize = new URL('https://github.com/login/oauth/authorize')
    authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
    authorize.searchParams.set('scope', 'repo user')
    authorize.searchParams.set('redirect_uri', redirectUri)
    return Response.redirect(authorize.toString(), 302)
  }

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code')
    if (!code) {
      return new Response(renderErrorPage('missing code'), {
        status: 400,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      })
    }
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      })
    })
    const data = await tokenRes.json()
    if (!data.access_token) {
      return new Response(renderErrorPage(data.error || 'token exchange failed'), {
        status: 400,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      })
    }
    return new Response(renderCallbackPage(data.access_token), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }

  return new Response('Not found', { status: 404 })
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env)
  }
}

// Step 2 of the admin sign-in: GitHub sends the visitor back here with a code,
// we swap it for an access token and hand it to the Decap admin window.
function page(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html><body><script>
(function () {
  function receive(e) {
    window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

  const { code, state } = req.query || {};
  const cookie = (req.headers.cookie || '').match(/(?:^|;\s*)decap_oauth_state=([a-f0-9]+)/);
  if (!code || !state || !cookie || cookie[1] !== state) {
    res.status(400).send(page('error', { message: 'Sign-in expired or invalid. Please try again.' }));
    return;
  }

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(data.error_description || 'no token');
    res.status(200).send(page('success', { token: data.access_token, provider: 'github' }));
  } catch (e) {
    res.status(500).send(page('error', { message: 'GitHub sign-in failed.' }));
  }
}

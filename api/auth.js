// Step 1 of the admin sign-in: send the visitor to GitHub to approve access.
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET set in Vercel.
import crypto from 'crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID is not set in Vercel.');
    return;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const state = crypto.randomBytes(16).toString('hex');

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', `${proto}://${host}/api/callback`);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);

  res.setHeader('Set-Cookie', `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.writeHead(302, { Location: url.toString() });
  res.end();
}

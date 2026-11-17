// v1=hex(HMAC_SHA256(secret, `${ts}.${payload}`))
const crypto = require('crypto');
const MAX_SKEW_SECONDS = 300;
const req = $input.first().json;
const timestamp = req.headers['x-lendloop-timestamp'];
const signature = String(req.headers['x-lendloop-signature'] || '');
const payload = req.body && req.body.payload;
const reject = (reason) => [{ json: { valid: false, reason } }];

if (!timestamp || !signature || typeof payload !== 'string') return reject('missing');
if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_SKEW_SECONDS) return reject('stale');
const expected = 'v1=' + crypto
  .createHmac('sha256', $env.LENDLOOP_WEBHOOK_SECRET)
  .update(`${timestamp}.${payload}`)
  .digest('hex');
const a = Buffer.from(expected);
const b = Buffer.from(signature);
if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return reject('bad_signature');

const event = JSON.parse(payload);
if (event.kind !== 'loan-event' || event.version !== 1) return reject('unsupported');
return [{ json: { valid: true, event } }];

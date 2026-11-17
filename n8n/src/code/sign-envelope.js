// HTTP retries reuse this timestamp, so they must happen within 5 minutes.
const crypto = require('crypto');
const payload = JSON.stringify($json.writeBack);
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = 'v1=' + crypto
  .createHmac('sha256', $env.LENDLOOP_WEBHOOK_SECRET)
  .update(`${timestamp}.${payload}`)
  .digest('hex');
return { json: { ...$json, signed: { payload, timestamp, signature } } };

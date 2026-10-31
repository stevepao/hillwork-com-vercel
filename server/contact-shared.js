const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Shared contact-form handling for local Node and Cloudflare Pages Functions.
 * `getEnv(name, defaultValue?)` reads config; `sendMail(message)` delivers the email.
 */
export async function handleContactRequest({
  method,
  body,
  headers = {},
  ip = null,
  getEnv,
  sendMail,
}) {
  if (method !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'});
  }

  const data = normalizeBody(body);

  if (!isPlainObject(data)) {
    return jsonResponse(400, {error: 'Invalid request body'});
  }

  const name = toTrimmedString(data.name);
  const email = toTrimmedString(data.email);
  const company = toTrimmedString(data.company);
  const message = toTrimmedString(data.message);
  const website = toTrimmedString(data.website);
  const turnstileToken = toTrimmedString(data.turnstileToken);

  // Honeypot field: real visitors never fill this in.
  if (website !== '') {
    return jsonResponse(200, {ok: true});
  }

  if (name === '' || email === '' || message === '') {
    return jsonResponse(422, {error: 'Name, email, and message are required'});
  }

  if (!isValidEmail(email)) {
    return jsonResponse(422, {error: 'Please enter a valid email address'});
  }

  if (name.length > 120 || email.length > 254 || company.length > 160 || message.length > 4000) {
    return jsonResponse(422, {error: 'One or more fields is too long'});
  }

  const turnstileSiteKey = getEnv('TURNSTILE_SITE_KEY');
  const turnstileSecretKey = getEnv('TURNSTILE_SECRET_KEY');

  if (turnstileSiteKey !== null || turnstileSecretKey !== null) {
    if (turnstileSiteKey === null || turnstileSecretKey === null) {
      console.error('Turnstile requires both TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.');
      return jsonResponse(500, {error: 'Contact form anti-spam is not configured yet'});
    }

    if (turnstileToken === '') {
      return jsonResponse(422, {error: 'Please complete the anti-spam check'});
    }

    const remoteIp = clientIp(headers, ip);
    const verified = await verifyTurnstile(turnstileSecretKey, turnstileToken, remoteIp);

    if (!verified) {
      return jsonResponse(422, {error: 'Anti-spam verification failed. Please try again'});
    }
  }

  const smtpUser = getEnv('SMTP_USER');
  const smtpPass = getEnv('SMTP_PASS');
  const contactTo = getEnv('CONTACT_TO');
  const contactFrom = getEnv('CONTACT_FROM', smtpUser);

  if (smtpUser === null || smtpPass === null || contactTo === null || contactFrom === null) {
    console.error('Contact form is missing SMTP_USER, SMTP_PASS, CONTACT_TO, or CONTACT_FROM.');
    return jsonResponse(500, {error: 'Contact form is not configured yet'});
  }

  const mailMessage = {
    from: {
      address: contactFrom,
      name: 'Hillwork Website',
    },
    to: contactTo,
    replyTo: {
      address: email,
      name,
    },
    subject: `Hillwork inquiry from ${name}`,
    text: [
      'New Hillwork website inquiry',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company !== '' ? company : 'Not provided'}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  };

  try {
    await sendMail(mailMessage);
    return jsonResponse(200, {ok: true});
  } catch (error) {
    console.error('Contact mail failed:', error);
    return jsonResponse(500, {error: 'Unable to send message right now'});
  }
}

export function jsonResponse(status, payload) {
  return {status, payload};
}

export function normalizeBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  return body ?? {};
}

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toTrimmedString(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parsePort(value) {
  const port = Number.parseInt(value ?? '', 10);
  return Number.isInteger(port) && port > 0 ? port : 465;
}

export function getHeader(headers, name) {
  const lowerName = name.toLowerCase();
  const value = headers[name] ?? headers[lowerName];

  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return headers.get(name) ?? headers.get(lowerName) ?? '';
  }

  return typeof value === 'string' ? value : '';
}

export function clientIp(headers, fallbackIp) {
  const cloudflareIp = getHeader(headers, 'cf-connecting-ip');

  if (cloudflareIp !== '') {
    return cloudflareIp;
  }

  const forwardedFor = getHeader(headers, 'x-forwarded-for');

  if (forwardedFor !== '') {
    return forwardedFor.split(',')[0].trim();
  }

  return fallbackIp;
}

export async function verifyTurnstile(secret, token, remoteIp) {
  const payload = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp !== null && remoteIp !== '') {
    payload.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
      signal: AbortSignal.timeout(5000),
    });
    const decoded = await response.json().catch(() => null);

    if (!isPlainObject(decoded)) {
      console.error('Turnstile verification returned invalid JSON.');
      return false;
    }

    return decoded.success === true;
  } catch (error) {
    console.error('Turnstile verification request failed:', error);
    return false;
  }
}

export function envFromObject(env) {
  return function getEnv(name, defaultValue = null) {
    const value = env?.[name];

    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    return value;
  };
}

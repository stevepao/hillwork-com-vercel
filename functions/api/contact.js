import {WorkerMailer} from '@workermailer/smtp';
import {
  envFromObject,
  handleContactRequest,
  parsePort,
} from '../../server/contact-shared.js';

export async function onRequestPost(context) {
  const getEnv = envFromObject(context.env);
  let body;

  try {
    body = await context.request.json();
  } catch {
    body = null;
  }

  const result = await handleContactRequest({
    method: 'POST',
    body,
    headers: context.request.headers,
    ip: context.request.headers.get('cf-connecting-ip'),
    getEnv,
    sendMail: (message) => sendWithWorkerMailer(getEnv, message),
  });

  return Response.json(result.payload, {status: result.status});
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }

  return Response.json({error: 'Method not allowed'}, {status: 405});
}

async function sendWithWorkerMailer(getEnv, message) {
  const smtpHost = getEnv('SMTP_HOST', 'smtp.purelymail.com');
  const smtpPort = parsePort(getEnv('SMTP_PORT', '465'));
  const smtpEncryption = (getEnv('SMTP_ENCRYPTION', 'ssl') ?? 'ssl').toLowerCase();
  const smtpUser = getEnv('SMTP_USER');
  const smtpPass = getEnv('SMTP_PASS');
  const secure = smtpEncryption === 'ssl' || smtpEncryption === 'smtps';
  const startTls = smtpEncryption === 'tls' || smtpEncryption === 'starttls';

  const mailer = await WorkerMailer.connect({
    host: smtpHost,
    port: smtpPort,
    secure,
    startTls: startTls || !secure,
    authType: 'login',
    credentials: {
      username: smtpUser,
      password: smtpPass,
    },
  });

  try {
    await mailer.send({
      from: {
        name: message.from.name,
        email: message.from.address,
      },
      to: message.to,
      reply: {
        name: message.replyTo.name,
        email: message.replyTo.address,
      },
      subject: message.subject,
      text: message.text,
    });
  } finally {
    if (typeof mailer.close === 'function') {
      await mailer.close().catch(() => {});
    }
  }
}

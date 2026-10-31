import nodemailer from 'nodemailer';
import {envValue} from './env.js';
import {handleContactRequest as handleSharedContactRequest, parsePort} from './contact-shared.js';

export async function handleContactRequest({method, body, headers = {}, ip = null}) {
  return handleSharedContactRequest({
    method,
    body,
    headers,
    ip,
    getEnv: envValue,
    sendMail: sendWithNodemailer,
  });
}

async function sendWithNodemailer(message) {
  const smtpHost = envValue('SMTP_HOST', 'smtp.purelymail.com');
  const smtpPort = parsePort(envValue('SMTP_PORT', '465'));
  const smtpEncryption = (envValue('SMTP_ENCRYPTION', 'ssl') ?? 'ssl').toLowerCase();
  const smtpUser = envValue('SMTP_USER');
  const smtpPass = envValue('SMTP_PASS');

  const secure = smtpEncryption === 'ssl' || smtpEncryption === 'smtps';
  const requireTLS = smtpEncryption === 'tls' || smtpEncryption === 'starttls';
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    requireTLS,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: {
      address: message.from.address,
      name: message.from.name,
    },
    to: message.to,
    replyTo: {
      address: message.replyTo.address,
      name: message.replyTo.name,
    },
    subject: message.subject,
    text: message.text,
  });
}

import nodemailer from 'nodemailer';
import dns from 'dns/promises';

const sendEmail = async (options) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing! Set SMTP_USER and SMTP_PASS in environment variables.');
    throw new Error('Email service not configured. Contact support.');
  }

  const originalHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  let resolvedIpv4 = originalHost;
  
  // Explicitly resolve the IPv4 address to bypass all Node/Nodemailer IPv6 bugs
  try {
    const { address } = await dns.lookup(originalHost, { family: 4 });
    resolvedIpv4 = address;
  } catch (err) {
    console.error('DNS IPv4 lookup failed, falling back to hostname:', err.message);
  }

  const transporter = nodemailer.createTransport({
    host: resolvedIpv4,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: originalHost, // Required so Gmail's SSL cert matches
      rejectUnauthorized: false,
    },
  });

  // Verify connection before sending
  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error('❌ SMTP connection failed:', verifyErr.message);
    throw new Error('Could not connect to email server. Check SMTP credentials.');
  }

  const message = {
    from: `${process.env.FROM_NAME || 'KcalCounter'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(message);
  console.log(`✅ Email sent to ${options.email}`);
};

export default sendEmail;

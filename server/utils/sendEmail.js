import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 for DNS resolution (best practice for serverless environments)
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  console.log('📧 Email function called via Nodemailer');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing! Set SMTP_USER and SMTP_PASS.');
    throw new Error('Email service not configured. Contact support.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 2525,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587/2525 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    socketTimeout: 15000,
  });

  console.log(`🔍 Verifying SMTP connection to ${process.env.SMTP_HOST}...`);
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
  } catch (verifyErr) {
    console.error('❌ SMTP connection failed:', verifyErr.message);
    throw new Error('Could not connect to SMTP server. Check credentials.');
  }

  try {
    const message = {
      from: `${process.env.FROM_NAME || 'KcalCounter'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log('📮 Sending email...');
    const info = await transporter.sendMail(message);
    console.log(`✅ Email sent successfully to ${options.email}!`);
    return info;
  } catch (sendErr) {
    console.error('❌ Failed to send email:', sendErr.message);
    throw sendErr;
  }
};

export default sendEmail;
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing! Set SMTP_USER and SMTP_PASS in environment variables.');
    throw new Error('Email service not configured. Contact support.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    family: 4, // Force IPv4 (fixes Render ENETUNREACH IPv6 bug)
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

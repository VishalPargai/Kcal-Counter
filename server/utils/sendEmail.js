import nodemailer from 'nodemailer';
import dns from 'dns';

// CRITICAL FIX FOR RENDER: Force Node.js to use IPv4 instead of IPv6
// This prevents the "ENETUNREACH 2607:..." crash on Render's network
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  console.log('📧 Email function called');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);
  
  // ✅ Step 1: Check environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing!');
    console.error('SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Missing');
    console.error('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
    throw new Error('Email service not configured. Contact support.');
  }

  console.log('✓ SMTP credentials found');

  // ✅ Step 2: Create transporter with improved settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // ✅ IMPORTANT: These settings help with Render's network
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    // ✅ Add connection timeout
    connectionTimeout: 5000,
    socketTimeout: 5000,
    // ✅ Retry logic
    maxConnections: 5,
    maxMessages: 100,
  });

  // ✅ Step 3: Verify connection with detailed logging
  console.log('🔍 Verifying SMTP connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (verifyErr) {
    console.error('❌ SMTP connection failed:', verifyErr.message);
    console.error('Error code:', verifyErr.code);
    console.error('Full error:', verifyErr);
    
    // ✅ Common fixes to suggest
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Verify SMTP_USER and SMTP_PASS are correct');
    console.error('2. For Gmail: Use App Password (not regular password)');
    console.error('3. Check: https://myaccount.google.com/apppasswords');
    console.error('4. App Password format: should be 16 characters with spaces');
    console.error('5. Verify "Less secure apps" is enabled (if not using App Password)');
    console.error('6. On Render, add all env vars and redeploy after changes');
    
    throw new Error('Could not connect to email server. Check SMTP credentials and logs.');
  }

  // ✅ Step 4: Send email with error handling
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
    console.log(`✅ Email sent successfully!`);
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return info;
  } catch (sendErr) {
    console.error('❌ Failed to send email:', sendErr.message);
    console.error('Error details:', sendErr);
    throw sendErr;
  }
};

export default sendEmail;
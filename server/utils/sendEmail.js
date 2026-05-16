import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in environment variables!');
  console.error('Go to https://sendgrid.com → Settings → API Keys');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  console.log('📧 Email function called via SendGrid');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);

  // ✅ Step 1: Validate API key
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY missing!');
    throw new Error('Email service not configured. Contact support.');
  }

  try {
    // ✅ Step 2: Prepare email message
    const msg = {
      to: options.email,
      from: `${process.env.FROM_NAME || 'KcalCounter'} <${process.env.FROM_EMAIL || 'noreply@kcalcounter.com'}>`,
      subject: options.subject,
      html: options.html || options.message,
      text: options.message || 'See HTML version for formatting',
      // ✅ Important: Tell SendGrid not to track clicks (optional)
      trackingSettings: {
        clickTracking: {
          enable: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    console.log('🔍 Validating email message...');
    console.log('From:', msg.from);
    console.log('To:', msg.to);
    console.log('Subject:', msg.subject);

    // ✅ Step 3: Send email
    console.log('📮 Sending email via SendGrid...');
    const response = await sgMail.send(msg);

    console.log('✅ Email sent successfully!');
    console.log('Status Code:', response[0].statusCode);
    console.log('Message ID:', response[0].headers['x-message-id']);

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode,
    };
  } catch (error) {
    console.error('❌ Failed to send email via SendGrid');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    // ✅ Detailed error handling
    if (error.response) {
      console.error('SendGrid response error:', error.response.body);

      // Common SendGrid errors
      if (error.response.body.errors) {
        error.response.body.errors.forEach((err) => {
          console.error(`- ${err.message} (${err.field})`);
        });
      }
    }

    // Helpful troubleshooting tips
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify SENDGRID_API_KEY is set on Render');
    console.error('2. Check API key is valid: https://sendgrid.com/settings/api_keys');
    console.error('3. Verify sender email in SendGrid: https://sendgrid.com/settings/sender_auth/senders');
    console.error('4. Make sure sender email is verified (check email for verification link)');
    console.error('5. Check SendGrid account is active and not rate-limited');

    throw new Error(
      error.response?.body?.errors?.[0]?.message ||
      'Failed to send email. Please try again later.'
    );
  }
};

export default sendEmail;
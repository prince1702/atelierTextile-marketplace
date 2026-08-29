const axios = require('axios');
const nodemailer = require('nodemailer');

/**
 * Send an email using HTTP REST API (Resend / Brevo / SendGrid) or fallback to SMTP.
 * Note: Render free tier blocks outbound SMTP ports 25, 465, 587.
 * Using an HTTP REST API over HTTPS (port 443) bypasses hosting firewall port restrictions.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html, apiKeyType }) => {
  const fromEmail = process.env.EMAIL_USER || 'sojitraprince172@gmail.com';
  const fromName = 'TexDesigner';
  
  const resendKey = apiKeyType === 'forget_password'
    ? (process.env.Forget_password || process.env.Email_login || process.env.RESEND_API_KEY)
    : (process.env.Email_login || process.env.RESEND_API_KEY);

  // 1. Try Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`📧 Sending email via Brevo API (HTTPS) to ${to}...`);
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: fromName, email: fromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      console.log(`📧 Brevo email sent successfully: ${response.data.messageId} → ${to}`);
      return response.data;
    } catch (brevoErr) {
      console.error('❌ Brevo API error:', brevoErr.response?.data || brevoErr.message);
    }
  }

  // 2. Try Resend HTTP API
  if (resendKey) {
    const senderDomains = [
      process.env.RESEND_FROM_EMAIL || 'TexDesigner <noreply@send.texdesigner.com>',
      'TexDesigner <noreply@texdesigner.com>',
      'TexDesigner <onboarding@resend.dev>',
    ];

    for (const fromAddress of senderDomains) {
      try {
        console.log(`📧 Sending email via Resend API from ${fromAddress} to ${to}...`);
        const response = await axios.post(
          'https://api.resend.com/emails',
          {
            from: fromAddress,
            to: [to],
            subject,
            html,
          },
          {
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        console.log(`📧 Resend email sent successfully (${fromAddress}): ${response.data.id} → ${to}`);
        return response.data;
      } catch (resendErr) {
        const errMsg = resendErr.response?.data?.message || resendErr.message;
        console.warn(`⚠️ Resend attempt (${fromAddress}) failed: ${errMsg}`);
      }
    }
  }

  // 3. Fallback to Nodemailer SMTP (for localhost)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      console.log('📧 Sending email via Nodemailer SMTP...');
      const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const isGmail = host.includes('gmail');

      const transportConfig = isGmail
        ? {
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
          }
        : {
            host,
            port: parseInt(process.env.EMAIL_PORT, 10) || 465,
            secure: (parseInt(process.env.EMAIL_PORT, 10) || 465) === 465,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
          };

      const transporter = nodemailer.createTransport(transportConfig);
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `${fromName} <${fromEmail}>`,
        to,
        subject,
        html,
      });
      console.log(`📧 SMTP email sent: ${info.messageId} → ${to}`);
      return info;
    } catch (smtpErr) {
      console.error('❌ SMTP Email error:', smtpErr.message);
      throw new Error(`SMTP email delivery failed: ${smtpErr.message}`);
    }
  }

  throw new Error('No email provider is configured or all providers failed. Unable to send email.');
};

module.exports = sendEmail;

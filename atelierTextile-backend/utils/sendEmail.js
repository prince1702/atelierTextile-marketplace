const axios = require('axios');
const nodemailer = require('nodemailer');

/**
 * Send an email using HTTP REST API (Resend / Brevo / SendGrid) or fallback to SMTP.
 * Note: Render free tier blocks outbound SMTP ports 25, 465, 587.
 * Using an HTTP REST API over HTTPS (port 443) bypasses hosting firewall port restrictions.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const fromEmail = process.env.EMAIL_USER || 'sojitraprince172@gmail.com';
  const fromName = 'TexDesigner';

  // 1. Try Resend HTTP API (Recommended for Render)
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Sending email via Resend API (HTTPS)...');
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: `${fromName} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    console.log(`📧 Resend email sent successfully: ${response.data.id} → ${to}`);
    return response.data;
  }

  // 2. Try Brevo HTTP API (Sendinblue)
  if (process.env.BREVO_API_KEY) {
    console.log('📧 Sending email via Brevo API (HTTPS)...');
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
  }

  // 3. Try SendGrid HTTP API
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Sending email via SendGrid API (HTTPS)...');
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: fromName },
        subject,
        content: [{ type: 'text/html', value: html }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    console.log(`📧 SendGrid email sent successfully → ${to}`);
    return response.data;
  }

  // 4. Fallback to Nodemailer SMTP (for localhost)
  console.log('📧 Sending email via Nodemailer SMTP...');
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const isGmail = host.includes('gmail');

  let transportConfig;
  if (isGmail) {
    transportConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    };
  } else {
    const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
    transportConfig = {
      host,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 SMTP email sent: ${info.messageId} → ${to}`);
  return info;
};

module.exports = sendEmail;

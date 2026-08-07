const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP credentials from environment variables.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
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
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
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
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const mailOptions = {
    from: process.env.EMAIL_FROM || `TexDesigner <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent successfully: ${info.messageId} → ${to}`);
  return info;
};

module.exports = sendEmail;


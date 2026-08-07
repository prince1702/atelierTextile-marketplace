const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP credentials from environment variables.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Timeouts to prevent hanging on slow/blocked SMTP connections
    connectionTimeout: 10000, // 10 seconds to establish connection
    greetingTimeout: 10000,   // 10 seconds for SMTP greeting
    socketTimeout: 15000,     // 15 seconds for socket inactivity
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `TexDesigner <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId} → ${to}`);
  return info;
};

module.exports = sendEmail;

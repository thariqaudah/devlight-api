const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter object
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Create email config option
  const emailConfig = {
    from: `${options.name} <${options.email}>`,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  // Send email
  const info = await transporter.sendMail(emailConfig);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

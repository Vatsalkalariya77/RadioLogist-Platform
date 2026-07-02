const nodemailer = require("nodemailer");
const AppError = require("./appError");

/**
 * Sends an email using Nodemailer SMTP transport.
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Text body content
 * @param {string} [options.html] - Optional HTML body content
 */
const sendEmail = async (options) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new AppError("Email service is misconfigured. SMTP credentials are missing.", 500);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: FROM_EMAIL || "RadioLogist Platform <no-reply@radiologist.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

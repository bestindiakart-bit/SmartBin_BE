import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP config
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send email
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} [options.text] - plain text body
 * @param {string} [options.html] - HTML body
 * @param {Array} [options.attachments] - attachments array for images/files
 */
export async function sendMail({ to, subject, text, html, attachments }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments, // support inline images
      contentType: "text/html",
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw err;
  }
}

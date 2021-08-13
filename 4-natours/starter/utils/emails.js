const nodemailer = require('nodemailer');

const sendmail = async function(options) {
  //    create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
  });
  // define options
  const mailOptions = {
    from: 'Test <test@fourplusmedia.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  //send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendmail;

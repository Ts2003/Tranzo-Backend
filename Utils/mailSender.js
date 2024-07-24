// utils/mailSender.js

require("dotenv").config();

const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 507,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    // Send emails to users
    let info = await transporter.sendMail({
      from: {
        name: "Tranzo",
        address: process.env.MAIL_USER
      },
      to: email,
      subject: title,
      text: "",
      html: body,
    });
    console.log("Email info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mailSender;



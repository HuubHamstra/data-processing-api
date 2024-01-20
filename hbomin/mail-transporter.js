const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hbomin.api@gmail.com',
    pass: 'uwid dtuk bokn odcv'
  }
});

module.exports = { transporter };
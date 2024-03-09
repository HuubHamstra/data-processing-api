const express = require('express');
const router = express.Router();
const mail = require('../../mail-transporter');
const validator = require('../validator');

router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { profileName, recipient, url } = req.body;

  if (!validator.emailValidation(res, recipient)) {
    return;
  }

  if (!validator.dataValidation(res, profileName, 'string') || !validator.dataValidation(res, url, 'string')) {
    return;
  }

  try {
    const mailOptions = {
      from: 'hbomin.api@gmail.com',
      to: recipient,
      subject: `${profileName} heeft je uitgenodigd om je in te schrijven aan HBO-Min`,
      text: `${url}`
    };

    mail.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).send({ error: 'Internal Server Error' });
      }
      else {
        res.status(200).send({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

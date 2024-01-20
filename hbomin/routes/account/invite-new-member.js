const express = require('express');
const router = express.Router();
const mail = require('../../mail-transporter');

router.post('/', async (req, res) => {
  const { profileName, recipient, url } = req.body;
  
  try {
    const mailOptions = {
      from: 'hbomin.api@gmail.com',
      to: recipient,
      subject: `${profileName} heeft je uitgenodigd om je in te schrijven aan HBO-Min`,
      text: `${url}`
    };

    await mail.transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Internal Server Error');
      }
      else {
        res.status(200).send('Email sent successfully');
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

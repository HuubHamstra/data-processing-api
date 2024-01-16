const express = require('express');
const router = express.Router();
const query = require('../query');
const bcrypt = require('bcrypt');

router.post('/', (req, res) => {
  const body = req.body;
  const full_name = body["fullname"];
  const email = body["email"];
  const password = body["password"];
  const split = splitFullName(full_name);
  const first_name = split["firstName"];
  const last_name = split["lastName"];

  hashPassword(password).then(hashed_password => {
    query.outputJSON(`CALL create_account('${first_name}', '${last_name}', '${email}','${hashed_password}', 0, 0, 'profile name', 'profile image', 18, 0, 0, 0, 0;`, router);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });
});

function splitFullName(fullName) {
  const nameArray = fullName.split(/\s+/);
  const firstName = nameArray[0];
  const lastName = nameArray.slice(1).join(' ');
  return { firstName, lastName };
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
};

module.exports = router;
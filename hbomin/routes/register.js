const express = require('express');
const router = express.Router();
const query = require('../query');
const bcrypt = require('bcrypt');

router.post('/', (req, res) => {
  const { full_name, email, password } = req.body;
  const { first_name, last_name } = splitFullName(full_name);

  function executeCreateAccount(fname, lname, email, password, pay_method, sub_id, prof_name, prof_image, prof_age, lang_id, view_movies, view_series, min_age, router) {
      const queryString = `CALL create_account('${fname}','${lname}','${email}','${password}',${pay_method},${sub_id},'${prof_name}','${prof_image}',${prof_age},${lang_id},${view_movies},${view_series},${min_age})`;

      query.outputJSON(queryString, router);
  }

  // Usage:
  executeCreateAccount('Fname', 'Lname', 'mail@mail.mail', 'password', 0, 0, 'profile name', 'profile image', 18, 0, 0, 0, 0, router);

  hashPassword(password).then(hashed_password => {
    query.outputJSON(`CALL create_account_small('${first_name}', '${last_name}', '${email}','${hashed_password}';`, router);
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
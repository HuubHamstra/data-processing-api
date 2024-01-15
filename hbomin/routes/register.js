var express = require('express');
var router = express.Router();
var query = require('../query');

const connection = require('../database');

function executeCreateAccount(fname, lname, email, password, pay_method, sub_id, prof_name, prof_image, prof_age, lang_id, view_movies, view_series, min_age, router) {
    const queryString = `CALL create_account('${fname}','${lname}','${email}','${password}',${pay_method},${sub_id},'${prof_name}','${prof_image}',${prof_age},${lang_id},${view_movies},${view_series},${min_age})`;

    query.outputJSON(queryString, router);
}

// Usage:
executeCreateAccount('Fname', 'Lname', 'mail@mail.mail', 'password', 0, 0, 'profile name', 'profile image', 18, 0, 0, 0, 0, router);


module.exports = router;

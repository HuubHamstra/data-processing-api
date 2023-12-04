var express = require('express');
const app = express();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/hello', (req, res) => {
  res.render('hello', { title: 'Express' });
});

module.exports = router;

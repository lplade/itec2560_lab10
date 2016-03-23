var express = require('express');
var router = express.Router();

/* home page. Redirect to /tasks listing. */
router.get('/', function(req, res, next) {
  res.render('/tasks');
});

module.exports = router;

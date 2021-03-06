const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
// Creates a new instance of our bouncer (args optional)
const bouncer = require ("express-bouncer")(500, 10000);

router.post('/signup', userCtrl.signup);
router.post('/login', bouncer.block, userCtrl.login);

module.exports = router;
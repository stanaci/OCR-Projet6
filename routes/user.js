const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
// Creates a new instance of our bouncer (args optional)
const bouncer = require ("express-bouncer")(2000, 900000);

router.post('/signup', bouncer.block, userCtrl.signup);
router.post('/login', bouncer.block, userCtrl.login);

module.exports = router;
'use strict';
const Auth = require('../services/auth')
const router = require('express').Router();

router.post('/github', Auth.loginGithub)
router.post('/verify_token', Auth.verifyToken)

module.exports = router;
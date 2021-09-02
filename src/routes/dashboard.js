const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');


router.get('/', helpers.isLoggedIn, async(req, res) => {
    console.log('On dashboard')
    const { IdCargo } = req.session.passport.user;
    res.render('layouts/dashboard', { IdCargo });

});

module.exports = router;
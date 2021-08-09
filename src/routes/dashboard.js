const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');


router.get('/', helpers.isLoggedIn, (req, res) => {
    console.log('On dashboard')
    const IdCargo = req.session.passport.user.IdCargo;
    res.render('layouts/dashboard', { IdCargo });

});

module.exports = router;
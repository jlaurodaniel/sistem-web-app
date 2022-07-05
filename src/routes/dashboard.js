const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');
const pool = require('../database');


router.get('/', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo } = req.session.passport.user;
    const a = await pool.query(`SELECT
    AsignacionPresupuesto.*
  FROM AsignacionPresupuesto`)

    res.render('layouts/dashboard', { IdCargo });

});

module.exports = router;
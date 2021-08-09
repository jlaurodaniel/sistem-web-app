const express = require('express');
const router = express.Router();
const passport = require("passport");
const helpers = require('../lib/helpers');
//Bienvenida
router.get('/', async(req, res) => {
    const OnIndex = true;
    res.render('welcome', { OnIndex });
    //Script para crear contraseñas de usuario
    //console.log(await helpers.encrypPassword('Sistem0889'));
});
//Registro

//Login
router.post('/', (req, res, next) => {
    passport.authenticate('local.signin', {
            successRedirect: '/Dashboard',
            failureRedirect: '/',
            failureFlash: true
        })(req, res, next)
        //console.log(await helpers.encrypPassword(req.body.Password));
        //const a = await pool.query('SELECT * FROM Usuarios WHERE IdUsuario =?')
        //res.redirect('/Dashboard')
});


module.exports = router;
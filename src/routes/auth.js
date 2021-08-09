const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');
const pool = require('../database');

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

router.get('/signUp', async(req, res) => {
    const IdCargo = req.session.passport.user.IdCargo;
    const cargos = await pool.query('SELECT * FROM Cargos')
    console.log(cargos)
    res.render('layouts/signUp', { IdCargo, cargos })
});
router.post('/signUp/', async(req, res) => {
    console.log(req.body)
    const { Nombre, SegundoNombre, PrimerApellido, SegundoApellido, Email, IdCargo } = req.body;
    const newUser = {
        IdCargo: helpers.isIntNull(parseInt(IdCargo, 10)),
        Nombre: Nombre,
        SegundoNombre: SegundoNombre,
        PrimerApellido: PrimerApellido,
        SegundoApellido: SegundoApellido,
        NombreUsuario: 'Sistem_' + Nombre,
        HashPassword: await helpers.encrypPassword('Sistem0889'),
        Email: Email
    }
    console.log(newUser);
    await pool.query('INSERT INTO Usuarios set ?', [newUser]);
    res.redirect('/Dashboard');
});
router.get('/updateProfile', async(req, res) => {
    const user = req.user
    console.log(user);
    res.render('layouts/updateProfile', { user })
});
module.exports = router;
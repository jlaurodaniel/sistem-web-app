const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');
const pool = require('../database');
const multer = require('multer');
const util = require('util')

const storage = multer.diskStorage({
    destination: '../storage/comprobantesRecursos',
    filename: function(req, file, cb) {
        cb('', 'img');
    }
})

const upload = multer({
    storage: storage
})

router.get('/', helpers.authForRecursos, async(req, res) => {
    //datos nuevo Recurso
    const IdCargo = req.session.passport.user.IdCargo;
    const CurrentUser = req.session.passport.user.IdUsuario
    const TiposDocumento = await pool.query('SELECT * FROM TiposDocumento')
    const Documentos = await pool.query(`SELECT Recursos.FolioReferencia, Recursos.Fecha,Recursos.MontoTotal,    Recursos.URLDocumento,    StatusRecurso.StatusRecurso,    TiposDocumento.TipoDocumento,    Recursos.IdRecurso  FROM Recursos    INNER JOIN StatusRecurso      ON Recursos.IdStatusRecurso = StatusRecurso.IdStatusRecurso    INNER JOIN TiposDocumento      ON Recursos.IdTipoDocumento = TiposDocumento.IdTipoDocumento WHERE Recursos.IdUsuarioCrea=${CurrentUser}`)
    res.render('layouts/cheques', { TiposDocumento, Documentos, IdCargo });
});

router.post('/', upload.single('comprobante'), async(req, res) => {
    console.log('post upload')
    console.log(req.body);
    const { IdTipoDocumento, folio, monto, comprobante } = req.body;
    const newCheque = {
        IdTipoDocumento: IdTipoDocumento,
        FolioReferencia: folio,
        MontoTotal: monto,
        URLDocumento: comprobante,
        IdUsuarioCrea: req.session.passport.user.IdUsuario
    }
    await pool.query('INSERT INTO Recursos set ?', [newCheque]);
    res.redirect('/cheques');

});

router.get('/asignar/:IdRecurso/:FolioReferencia', helpers.authForRecursos, async(req, res) => {
    const { IdRecurso } = req.params;
    const { FolioReferencia } = req.params;
    const IdCargo = req.session.passport.user.IdCargo;
    //datos asignacion de recursos   
    // const montoRecurso = await pool.query('SELECT MontoTotal FROM Recursos WHERE Recursos.IdRecurso = 1')
    // const { MontoTotal } = montoRecurso;
    const montoRecurso = await pool.query('SELECT MontoTotal FROM Recursos WHERE Recursos.IdRecurso =' + IdRecurso)
    const { MontoTotal } = montoRecurso[0];
    const Cotizaciones = await pool.query('SELECT * FROM Cotizaciones')
    const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
    const Obras = await pool.query('SELECT * FROM Obras')
    const Departamentos = await pool.query('SELECT * FROM Departamentos')
    const Usuarios = await pool.query('SELECT  Usuarios.IdUsuario, Usuarios.Nombre,Usuarios.PrimerApellido,Cargos.Cargo FROM Usuarios INNER JOIN Cargos ON Usuarios.IdCargo = Cargos.IdCargo')

    // console.log('Monto ' + MontoTotal)
    //console.log(util.inspect(montoRecurso, { showHidden: false, depth: null }))
    res.render('layouts/asignarCheques', { IdCargo, Cotizaciones, TipoAsignacion, Obras, Departamentos, Usuarios, IdRecurso, FolioReferencia, MontoTotal });
    //console.log(req.session);
});

router.post('/asignar/:IdRecurso', helpers.authForRecursos, async(req, res) => {
    //falta verificar el que status del recurso sea sin asignar
    console.log(req.body);
    const { IdRecurso } = req.params;
    const montoRecurso = await pool.query('SELECT MontoTotal FROM Recursos WHERE Recursos.IdRecurso =' + IdRecurso)
    const { MontoTotal } = montoRecurso[0];
    console.log(util.inspect(montoRecurso, { showHidden: false, depth: null }))
    console.log(util.inspect(MontoTotal, { showHidden: false, depth: null }))
    const { IdInputTipoAsignacion, IdObra, IdDepto, IdCotizacion, IdUsuarioAsignado, comentarios } = req.body;
    const asignacion = {
        IdUsuarioAsigna: req.session.passport.user.IdUsuario,
        IdUsuarioRecibe: parseInt(IdUsuarioAsignado, 10),
        IdTipoAsignacion: parseInt(IdInputTipoAsignacion, 10),
        IdCotizacion: helpers.isIntNull(parseInt(IdCotizacion, 10)),
        IdRecurso: parseInt(IdRecurso, 10),
        IdObra: helpers.isIntNull(parseInt(IdObra, 10)),
        IdDepartamento: helpers.isIntNull(parseInt(IdDepto, 10)),
        Monto: MontoTotal,
        Observacion: comentarios
    };
    console.log(asignacion);
    const sp_AsignarRecurso = await pool.query(`CALL sp_AsignarRecurso(${asignacion.IdUsuarioAsigna}, ${asignacion.IdUsuarioRecibe}, ${asignacion.IdDepartamento}, ${asignacion.IdObra},${asignacion.IdRecurso}, ${asignacion.IdCotizacion}, ${asignacion.IdTipoAsignacion}, ${asignacion.Monto}, '${asignacion.Observacion}');`)
    console.log(sp_AsignarRecurso);
    res.redirect('/cheques')
});
module.exports = router;
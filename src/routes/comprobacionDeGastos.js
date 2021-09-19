const express = require('express');
const router = express.Router();
const pool = require('../database');
const util = require('util')
const helpers = require('../lib/helpers');
const comprobacionDeGastosModel = require('../models/comprobacionDeGastosModel');
//console.log(util.inspect(Reasignaciones, { showHidden: false, depth: null }));

router.get('/', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo, IdUsuario } = req.session.passport.user;
    try {
        const { Asignaciones, Reasignaciones } = await comprobacionDeGastosModel.getIndex(IdUsuario);
        res.render('layouts/comprobacionDeGastos', { Reasignaciones, Asignaciones, IdCargo });
    } catch (e) {
        req.flash('message', 'Error causado por excepcion en la base de datos =>: ' + e.message);
        res.redirect('back');
    }
});
router.get('/asignadas', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo, IdUsuario } = req.session.passport.user;
    try {
        const { Asignaciones, Reasignaciones } = await comprobacionDeGastosModel.getAsignadas(IdUsuario);
        res.render('layouts/comprobacionDeGastosAsignadas', { Reasignaciones, Asignaciones, IdCargo });
    } catch (e) {
        req.flash('message', 'Error causado por excepcion en la base de datos =>: ' + e.message);
        res.redirect('back');
    }
});

router.get('/detallesComprobacion/:IdAsignacionPresupuesto', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo } = req.session.passport.user;
    const { IdAsignacionPresupuesto } = req.params;
    try {
        const { AsignacionPresupuesto, ComprobacionesDeGasto, Reasignaciones, totalGastos } = await comprobacionDeGastosModel.getDetallesComprobacion(IdAsignacionPresupuesto);
        //console.log(ComprobacionesDeGasto)
        // console.log(Reasignaciones)
        res.render('layouts/detallesComprobacion', { IdCargo, AsignacionPresupuesto, ComprobacionesDeGasto, totalGastos, Reasignaciones });
    } catch (e) {
        req.flash('message', 'Error causado por excepcion .. =>: ' + e.message);
        res.redirect('back');
    }
});
router.get('/comprobar/:IdAsignacionPresupuesto/:IdReasignacion', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo, IdUsuario } = req.session.passport.user;
    const { IdAsignacionPresupuesto, IdReasignacion } = req.params;
    try {
        const {
            Contribuyentes,
            AsignacionesPresupuesto,
            ReasignacionesData,
            TipoAsignacion,
            Usuarios,
            Obras,
            comprobaciones
        } = await comprobacionDeGastosModel.getComprobar(IdAsignacionPresupuesto, IdUsuario);

        const AsignacionPresupuesto = AsignacionesPresupuesto[0];
        var AsignacionUserData = {}
        if (IdReasignacion === '0') {
            //aqui va la consulta de la asignacion
            const { Fecha, Monto, MontoAsignado, Observacion, IdTipoAsignacion } = AsignacionPresupuesto;
            AsignacionUserData = {
                Fecha: Fecha,
                MontoAsignado: Monto,
                CajaChica: MontoAsignado,
                Observacion: Observacion,
                IdTipoAsignacion: IdTipoAsignacion
            };

        } else {
            //aqui la consulta de la reasignacion by id
            const Data = await pool.query(`
        SELECT
          Reasignaciones.MontoAsignado,
          Reasignaciones.IdTipoAsignacion,     
          Reasignaciones.CajaChica,
          Reasignaciones.Observacion,
          Reasignaciones.FECHA
        FROM Reasignaciones
        WHERE Reasignaciones.IdReasignacion =${IdReasignacion}
        `)
            AsignacionUserData = Data[0];
        }
        const Rubros = await pool.query(`
                          SELECT  Rubros.IdRubro, Rubros.Rubro
                          FROM Rubros
                          WHERE Rubros.IdTipoAsignacion = ${AsignacionUserData.IdTipoAsignacion}`);
        const individualComprobaciones = comprobaciones.filter(comprobaciones => comprobaciones.IdUsuarioComprueba == IdUsuario);

        console.log(individualComprobaciones)
        console.log(`inonso`)
        if (AsignacionUserData.CajaChica == 0) {
            req.flash('info', 'No hay mas que comprobar...Los gastos han completado la comprobacion');
        }
        res.render('layouts/comprobar', { Obras, Usuarios, IdReasignacion, ReasignacionesData, AsignacionUserData, AsignacionPresupuesto, IdCargo, IdUsuario, IdAsignacionPresupuesto, Rubros, Contribuyentes, comprobaciones, individualComprobaciones, TipoAsignacion });
    } catch (e) {
        req.flash('error', 'Error causado por excepcion =>: ' + e.message);
        res.redirect('back');
    }
})

router.post('/comprobar/:IdAsignacionPresupuesto/:IdReasignacion/:CajaChica', helpers.isLoggedIn, async(req, res) => {
    const CurrentUser = req.session.passport.user.IdUsuario;
    //console.log(req.body);
    const { IdAsignacionPresupuesto, IdReasignacion, CajaChica } = req.params
    const { Concepto, IdRubro, Gasto, NotaFactura, IdContribuyente, UrlArchivo } = req.body;
    const ComprobacionData = {
        Concepto: helpers.isStringNull(Concepto),
        IdRubro: helpers.isIntNull(parseInt(IdRubro, 10)),
        URLDocumento: helpers.isStringNull(UrlArchivo),
        FolioNotaFactura: helpers.isStringNull(NotaFactura),
        IdContribuyente: helpers.isIntNull(parseInt(IdContribuyente, 10)),
        Gasto: helpers.isIntZero(parseFloat(Gasto, 10)),
        IdAsignacionPresupuesto: helpers.isIntNull(parseInt(IdAsignacionPresupuesto, 10))
    }
    if (Gasto <= 0) {
        req.flash('message', 'El monto debe ser mayor a $0.00 MX');
        res.redirect('back');
        //res.redirect(`/comprobacionDeGastos/comprobar/${IdAsignacionPresupuesto}/${IdReasignacion}`)
    } else if (parseFloat(Gasto, 10) > parseFloat(CajaChica, 10)) {
        req.flash('message', 'El monto debe ser menor que ' + helpers.FMoney(parseFloat(CajaChica, 10)) + ' MX');
        res.redirect('back');
    } else {
        try {
            const { ComprobacionResult } =
            await comprobacionDeGastosModel.postComprobar(IdAsignacionPresupuesto, IdReasignacion, ComprobacionData, CurrentUser);
            //console.log(ComprobacionData)
            req.flash('info', 'Gasto comprobado exitosamente:[' + helpers.FMoney(parseFloat(Gasto, 10)) + 'MX] Por concepto de ' + Concepto);
            res.redirect('back');
        } catch (e) {
            req.flash('message', 'Error causado por excepcion =>: ' + e.message);
            res.redirect('back');
        }
    }
})

router.get('/reasignar/:IdAsignacionPresupuesto/:IdReasignacion', helpers.authForComprobacionDeGastos, async(req, res) => {
    const { IdCargo } = req.session.passport.user;
    const { IdAsignacionPresupuesto, IdReasignacion } = req.params;
    const Obras = await pool.query('SELECT * FROM Obras')
    const Usuarios = await pool.query('SELECT  Usuarios.IdUsuario, Usuarios.Nombre,Usuarios.PrimerApellido,Cargos.Cargo FROM Usuarios INNER JOIN Cargos ON Usuarios.IdCargo = Cargos.IdCargo')
    var PresupuestoDisponible = {};
    if (IdReasignacion === '0') {
        const AsignacionesPresupuesto = await pool.query(`
          SELECT
            AsignacionPresupuesto.MontoAsignado
          FROM AsignacionPresupuesto
          WHERE AsignacionPresupuesto.IdAsignacionPresupuesto =${IdAsignacionPresupuesto}`)
        const Data = AsignacionesPresupuesto[0];
        PresupuestoDisponible = {
            Id: Data.IdAsignacionPresupuesto,
            MontoDisponible: Data.MontoAsignado
        }
    } else {
        const ReAsignacionesPresupuesto = await pool.query(`
          SELECT
            Reasignaciones.IdReasignacion,
            Reasignaciones.IdAsignacionPresupuesto,
            Reasignaciones.CajaChica
          FROM Reasignaciones
          WHERE Reasignaciones.IdReasignacion = ${IdReasignacion}`)
        const Data = ReAsignacionesPresupuesto[0];
        PresupuestoDisponible = {
            Id: Data.IdReasignacion,
            MontoDisponible: Data.CajaChica
        }
    }
    const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
    res.render('layouts/reasignar', { PresupuestoDisponible, Obras, Usuarios, IdCargo, TipoAsignacion, IdAsignacionPresupuesto, IdReasignacion });
})

router.post('/reasignar/:IdAsignacionPresupuesto/:IdReasignacion', helpers.authForComprobacionDeGastos, async(req, res) => {
    var validForm = true;
    const CurrentUser = req.session.passport.user.IdUsuario;
    const { IdAsignacionPresupuesto, IdReasignacion } = req.params;
    const { IdInputTipoAsignacion, IdObra, IdUsuarioAsignado, comentarios, monto } = req.body;
    const reasignarData = {
        IdInputTipoAsignacion: helpers.isIntNull(parseInt(IdInputTipoAsignacion, 10)),
        IdObra: helpers.isIntNull(parseInt(IdObra, 10)),
        IdUsuarioAsignado: helpers.isIntNull(parseInt(IdUsuarioAsignado, 10)),
        comentarios: helpers.isStringNull(comentarios),
        monto: helpers.isIntZero(parseFloat(monto, 10)),
    }
    var PresupuestoDisponible = {};
    if (IdReasignacion === '0') {
        const AsignacionesPresupuesto = await pool.query(`
          SELECT
            AsignacionPresupuesto.MontoAsignado
          FROM AsignacionPresupuesto
          WHERE AsignacionPresupuesto.IdAsignacionPresupuesto =${IdAsignacionPresupuesto}`)
        PresupuestoDisponible = AsignacionesPresupuesto[0].MontoAsignado;
    } else {
        const ReAsignacionesPresupuesto = await pool.query(`
          SELECT
            Reasignaciones.IdReasignacion,
            Reasignaciones.IdAsignacionPresupuesto,
            Reasignaciones.CajaChica
          FROM Reasignaciones
          WHERE Reasignaciones.IdReasignacion = ${IdReasignacion}`)
        PresupuestoDisponible = ReAsignacionesPresupuesto[0].CajaChica;
    }
    //VALIDANDO TIPO DE ASIGNACION
    if (reasignarData.IdInputTipoAsignacion < 1) {
        console.log('invalid tipo de asignacion')
        validForm = false;
        req.flash('message', 'Debe seleccionar un tipo de asignacion');
        res.redirect('back');
    }
    // VALIDANDO USUARIO
    if (reasignarData.IdUsuarioAsignado < 1) {
        validForm = false;
        req.flash('message', 'Debe seleccionar el usuario a recibir la reasignacion');
        res.redirect('back');
    }
    // VALIDANDO MONTO
    if (reasignarData.monto >= PresupuestoDisponible) {
        validForm = false;
        req.flash('message', 'La cantidad Ingresada no debe de superar el monto de $' + PresupuestoDisponible);
        res.redirect('back');
    }
    if (validForm) {
        const reasignarResult = await pool.query(`CALL ReasignarPresupuesto(${reasignarData.monto}, '${reasignarData.comentarios}',${CurrentUser}, ${reasignarData.IdUsuarioAsignado},${reasignarData.IdInputTipoAsignacion}, ${IdAsignacionPresupuesto}, ${reasignarData.IdObra}, ${IdReasignacion});`)
        console.log(reasignarResult);
        res.redirect(`/comprobacionDeGastos`);
    }
})
module.exports = router;
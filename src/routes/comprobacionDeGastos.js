const express = require('express');
const router = express.Router();
const pool = require('../database');
const util = require('util')
const helpers = require('../lib/helpers');

router.get('/', helpers.isLoggedIn, async(req, res) => {
    const IdCargo = req.session.passport.user.IdCargo;
    const CurrentUser = req.session.passport.user.IdUsuario;
    const ComprobacionesDeGastos = await pool.query(`
    SELECT
  ComprobacionGastos.IdComprobacionGastos,
  ComprobacionGastos.IdAsignacionPresupuesto,
  TipoJustificacion.TipoJustificacion,
  ComprobacionGastos.Monto,
  ComprobacionGastos.Concepto,
  ComprobacionGastos.Fecha,
  ComprobacionGastos.FolioNotaFactura,
  Rubros.Rubro,
  Contribuyentes.Contribuyente
FROM ComprobacionGastos
  left  JOIN TipoJustificacion
    ON ComprobacionGastos.IdTipoJustificacion = TipoJustificacion.IdTipoJustificacion
  left  JOIN Rubros
    ON ComprobacionGastos.IdRubro = Rubros.IdRubro
  left  JOIN Contribuyentes
    ON ComprobacionGastos.IdContribuyente = Contribuyentes.IdContribuyente
WHERE ComprobacionGastos.IdUsuarioComprueba = ${CurrentUser}
    `);
    const Asignaciones = await pool.query(`SELECT
    AsignacionPresupuesto.IdAsignacionPresupuesto,
    AsignacionPresupuesto.Monto,
    AsignacionPresupuesto.CajaChica,
    AsignacionPresupuesto.Fecha,
    AsignacionPresupuesto.IdUsuarioAsigna,
    AsignacionPresupuesto.Observacion,
    Usuarios.Nombre,
    Cargos.Cargo,
    StatusAsignacionPresupuesto.StatusAsignacionPresupuesto,
    TipoAsignacion.TipoAsignacion
  FROM AsignacionPresupuesto
    INNER JOIN Usuarios
      ON AsignacionPresupuesto.IdUsuarioAsigna = Usuarios.IdUsuario
    INNER JOIN Cargos
      ON Usuarios.IdCargo = Cargos.IdCargo
    INNER JOIN StatusAsignacionPresupuesto
      ON AsignacionPresupuesto.IdStatusAsignacionPresupuesto = StatusAsignacionPresupuesto.IdStatusAsignacionPresupuesto
    INNER JOIN TipoAsignacion
      ON AsignacionPresupuesto.IdTipoAsignacion = TipoAsignacion.IdTipoAsignacion
  WHERE AsignacionPresupuesto.IdUsuarioRecibe = ${CurrentUser}`)
    const Reasignaciones = await pool.query(`SELECT
  Reasignaciones.IdReasignacion,
  Reasignaciones.IdAsignacionPresupuesto,
  Reasignaciones.MontoAsignado,
  Reasignaciones.CajaChica,
  Reasignaciones.Fecha,
  Reasignaciones.IdUsuarioAsigna,
  Reasignaciones.Observacion,
    Usuarios.Nombre,
    Cargos.Cargo,
    StatusAsignacionPresupuesto.StatusAsignacionPresupuesto,
    TipoAsignacion.TipoAsignacion
  FROM Reasignaciones
    INNER JOIN Usuarios
      ON Reasignaciones.IdUsuarioAsigna = Usuarios.IdUsuario
    INNER JOIN Cargos
      ON Usuarios.IdCargo = Cargos.IdCargo
    INNER JOIN StatusAsignacionPresupuesto
      ON Reasignaciones.IdStatusAsignacionPresupuesto = StatusAsignacionPresupuesto.IdStatusAsignacionPresupuesto
    INNER JOIN TipoAsignacion
      ON Reasignaciones.IdTipoAsignacion = TipoAsignacion.IdTipoAsignacion
  WHERE Reasignaciones.IdUsuarioRecibe = ${CurrentUser}`)
    console.log('Comprobacion: ' + Asignaciones);
    console.log(util.inspect(Asignaciones, { showHidden: false, depth: null }));
    res.render('layouts/comprobacionDeGastos', { Reasignaciones, Asignaciones, ComprobacionesDeGastos, IdCargo });
});

router.get('/comprobar/:IdAsignacionPresupuesto/:IdReasignacion', helpers.isLoggedIn, async(req, res) => {
    const { IdCargo, IdUsuario } = req.session.passport.user;
    const { IdAsignacionPresupuesto, IdReasignacion } = req.params;
    const Contribuyentes = await pool.query(`SELECT IdContribuyente, Contribuyente FROM Contribuyentes;`)
    const AsignacionesPresupuesto = await pool.query(`
    SELECT
  AsignacionPresupuesto.Monto,
  AsignacionPresupuesto.CajaChica,
  AsignacionPresupuesto.Fecha,
  AsignacionPresupuesto.Observacion,
  Usuarios.Nombre AS NombreRecibe,
  Cargos.Cargo AS CargoRecibe,
  Cargos_1.Cargo AS CargoAsigna,
  Usuarios_1.Nombre AS NombreAsigna,
  AsignacionPresupuesto.IdAsignacionPresupuesto,
  AsignacionPresupuesto.IdCotizacion,
  AsignacionPresupuesto.IdRecurso,
  AsignacionPresupuesto.IdObra,
  AsignacionPresupuesto.IdDepartamento,
  Usuarios.PrimerApellido AS ApellidoRecibe,
  Usuarios_1.PrimerApellido AS ApellidoAsigna,
  AsignacionPresupuesto.IdTipoAsignacion,
  AsignacionPresupuesto.MontoAsignado,
  StatusAsignacionPresupuesto.StatusAsignacionPresupuesto
FROM AsignacionPresupuesto
  INNER JOIN Usuarios
    ON AsignacionPresupuesto.IdUsuarioRecibe = Usuarios.IdUsuario
  INNER JOIN Cargos
    ON Usuarios.IdCargo = Cargos.IdCargo
  INNER JOIN Usuarios Usuarios_1
    ON AsignacionPresupuesto.IdUsuarioAsigna = Usuarios_1.IdUsuario
  INNER JOIN Cargos Cargos_1
    ON Usuarios_1.IdCargo = Cargos_1.IdCargo
  INNER JOIN StatusAsignacionPresupuesto
    ON AsignacionPresupuesto.IdStatusAsignacionPresupuesto = StatusAsignacionPresupuesto.IdStatusAsignacionPresupuesto
WHERE AsignacionPresupuesto.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}`)
    const AsignacionPresupuesto = AsignacionesPresupuesto[0];
    const { IdTipoAsignacion } = AsignacionPresupuesto;
    const comprobaciones = await pool.query(`SELECT
    ComprobacionGastos.Monto,
    ComprobacionGastos.Concepto,
    ComprobacionGastos.Fecha,
    ComprobacionGastos.URLDocumento,
    Rubros.Rubro,
    ComprobacionGastos.FolioNotaFactura,
    Contribuyentes.Contribuyente
  FROM ComprobacionGastos
    INNER JOIN Rubros
      ON ComprobacionGastos.IdRubro = Rubros.IdRubro
    INNER JOIN Contribuyentes
      ON ComprobacionGastos.IdContribuyente = Contribuyentes.IdContribuyente
  WHERE ComprobacionGastos.IdAsignacionPresupuesto =${IdAsignacionPresupuesto}`)
    const ReasignacionesData = await pool.query(`
  SELECT
  Reasignaciones.MontoAsignado,
  Reasignaciones.Observacion,
  Reasignaciones.FECHA,
  Reasignaciones.CajaChica,
  Usuarios.Nombre,
  Usuarios.PrimerApellido,
  Cargos.Cargo
FROM Reasignaciones
  INNER JOIN Usuarios
    ON Reasignaciones.IdUsuarioRecibe = Usuarios.IdUsuario
  INNER JOIN Cargos
    ON Usuarios.IdCargo = Cargos.IdCargo
WHERE Reasignaciones.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}
AND Reasignaciones.IdUsuarioAsigna = ${IdUsuario}
  `)
    const Usuarios = await pool.query('SELECT  Usuarios.IdUsuario, Usuarios.Nombre,Usuarios.PrimerApellido,Cargos.Cargo FROM Usuarios INNER JOIN Cargos ON Usuarios.IdCargo = Cargos.IdCargo')
    const Obras = await pool.query('SELECT * FROM Obras')
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
        console.log(util.inspect(AsignacionUserData, { showHidden: false, depth: null }));
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
    var totalSuma = 0;
    comprobaciones.forEach(function getTotal(element, index, array) {
        totalSuma = totalSuma + array[index].Monto;
        //console.log(array[index].Monto);
    })
    const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
        //const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
    const Rubros = await pool.query(`
                          SELECT  Rubros.IdRubro, Rubros.Rubro
                          FROM Rubros
                          WHERE Rubros.IdTipoAsignacion = ${AsignacionUserData.IdTipoAsignacion}`)
    res.render('layouts/comprobar', { Obras, Usuarios, IdReasignacion, ReasignacionesData, AsignacionUserData, totalSuma, AsignacionPresupuesto, IdCargo, IdAsignacionPresupuesto, Rubros, Contribuyentes, comprobaciones, TipoAsignacion });
})

router.post('/comprobar/:IdAsignacionPresupuesto/:IdReasignacion', async(req, res) => {
    const CurrentUser = req.session.passport.user.IdUsuario;
    console.log(req.body);
    const { IdAsignacionPresupuesto, IdReasignacion } = req.params
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
        res.redirect(`/comprobacionDeGastos/comprobar/${IdAsignacionPresupuesto}/${IdReasignacion}`)
    } else {
        const cajaChicaObj = await pool.query(`
    SELECT
        AsignacionPresupuesto.CajaChica
    FROM AsignacionPresupuesto
    WHERE AsignacionPresupuesto.IdAsignacionPresupuesto =${IdAsignacionPresupuesto}`)
        const { CajaChica } = cajaChicaObj[0];
        const newMonto = parseFloat((CajaChica - ComprobacionData.Gasto).toFixed(2), 10);

        const ComprobacionResult = await pool.query(`
       CALL AgregarGasto(${IdAsignacionPresupuesto}, ${ComprobacionData.Gasto}, '${ComprobacionData.Concepto}', '${ComprobacionData.URLDocumento}', ${ComprobacionData.IdRubro},'${ComprobacionData.FolioNotaFactura}', ${ComprobacionData.IdContribuyente}, ${newMonto}, ${CurrentUser},${IdReasignacion});
                     `)
        console.log(ComprobacionResult)

        console.log(ComprobacionData)
            //console.log(ComprobacionData)
            //console.log(util.inspect(req.params, { showHidden: false, depth: null }))
        res.redirect('/comprobacionDeGastos');
    }
})

router.get('/reasignar/:IdAsignacionPresupuesto/:IdUsuarioRaizAsigna', helpers.authForComprobacionDeGastos, async(req, res) => {
    const IdCargo = req.session.passport.user.IdCargo;
    const { IdAsignacionPresupuesto, IdUsuarioRaizAsigna } = req.params;
    const Obras = await pool.query('SELECT * FROM Obras')
    const Usuarios = await pool.query('SELECT  Usuarios.IdUsuario, Usuarios.Nombre,Usuarios.PrimerApellido,Cargos.Cargo FROM Usuarios INNER JOIN Cargos ON Usuarios.IdCargo = Cargos.IdCargo')
    const AsignacionesPresupuesto = await pool.query(`
        SELECT
        AsignacionPresupuesto.Monto,
        AsignacionPresupuesto.CajaChica,
        AsignacionPresupuesto.Fecha,
        AsignacionPresupuesto.Observacion,
        Usuarios.Nombre AS NombreRecibe,
        Cargos.Cargo AS CargoRecibe,
        Cargos_1.Cargo AS CargoAsigna,
        Usuarios_1.Nombre AS NombreAsigna,
        AsignacionPresupuesto.IdStatusAsignacionPresupuesto,
        AsignacionPresupuesto.IdAsignacionPresupuesto,
        AsignacionPresupuesto.IdCotizacion,
        AsignacionPresupuesto.IdRecurso,
        AsignacionPresupuesto.IdObra,
        AsignacionPresupuesto.IdDepartamento,
        Usuarios.PrimerApellido AS ApellidoRecibe,
        Usuarios_1.PrimerApellido AS ApellidoAsigna,
        AsignacionPresupuesto.IdTipoAsignacion
      FROM AsignacionPresupuesto
        INNER JOIN Usuarios
          ON AsignacionPresupuesto.IdUsuarioRecibe = Usuarios.IdUsuario
        INNER JOIN Cargos
          ON Usuarios.IdCargo = Cargos.IdCargo
        INNER JOIN Usuarios Usuarios_1
          ON AsignacionPresupuesto.IdUsuarioAsigna = Usuarios_1.IdUsuario
        INNER JOIN Cargos Cargos_1
          ON Usuarios_1.IdCargo = Cargos_1.IdCargo
      WHERE AsignacionPresupuesto.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}`)
    const AsignacionPresupuesto = AsignacionesPresupuesto[0];
    const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
    res.render('layouts/reasignar', { IdUsuarioRaizAsigna, Obras, Usuarios, IdCargo, AsignacionPresupuesto, TipoAsignacion, IdAsignacionPresupuesto });
})

router.post('/reasignar/:IdAsignacionPresupuesto/:IdUsuarioRaizAsigna', async(req, res) => {
    const CurrentUser = req.session.passport.user.IdUsuario;
    const { IdAsignacionPresupuesto, IdUsuarioRaizAsigna } = req.params;
    const { IdInputTipoAsignacion, IdObra, IdUsuarioAsignado, comentarios, monto } = req.body;
    const reasignarData = {
        IdInputTipoAsignacion: helpers.isIntNull(parseInt(IdInputTipoAsignacion, 10)),
        IdObra: helpers.isIntNull(parseInt(IdObra, 10)),
        IdUsuarioAsignado: helpers.isIntNull(parseInt(IdUsuarioAsignado, 10)),
        comentarios: helpers.isStringNull(comentarios),
        monto: helpers.isIntZero(parseFloat(monto, 10)),
    }
    const reasignarResult = await pool.query(`CALL ReasignarPresupuesto(${reasignarData.monto}, '${reasignarData.comentarios}',${CurrentUser}, ${reasignarData.IdUsuarioAsignado},${reasignarData.IdInputTipoAsignacion}, ${IdAsignacionPresupuesto}, ${reasignarData.IdObra}, ${IdUsuarioRaizAsigna});`)
    console.log(req.params);
    console.log(reasignarData);
    /*
    Falta modificar los procedimientos almacenados para el campo Monto asignado y agregar las reasignaciones a la tabla de asignaciones
    */
    res.redirect(`/comprobacionDeGastos`);
})
module.exports = router;
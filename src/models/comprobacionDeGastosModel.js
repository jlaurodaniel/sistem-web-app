const pool = require('../database');
const util = require('util')
const helpers = require('../lib/helpers');

const comprobacionDeGastosModel = {};

comprobacionDeGastosModel.getIndex = async(CurrentUser) => {
    const Asignaciones = await pool.query(`SELECT
    AsignacionPresupuesto.IdAsignacionPresupuesto,
    Usuarios.Nombre,
    Usuarios.PrimerApellido,
    StatusAsignacionPresupuesto.StatusAsignacionPresupuesto,
    TipoAsignacion.TipoAsignacion,
    AsignacionPresupuesto.Monto,
    AsignacionPresupuesto.CajaChica,
    AsignacionPresupuesto.Fecha,
    AsignacionPresupuesto.Observacion
  FROM AsignacionPresupuesto
    INNER JOIN Usuarios
      ON AsignacionPresupuesto.IdUsuarioRecibe = Usuarios.IdUsuario
    INNER JOIN StatusAsignacionPresupuesto
      ON AsignacionPresupuesto.IdStatusAsignacionPresupuesto = StatusAsignacionPresupuesto.IdStatusAsignacionPresupuesto
    INNER JOIN TipoAsignacion
      ON AsignacionPresupuesto.IdTipoAsignacion = TipoAsignacion.IdTipoAsignacion
  WHERE AsignacionPresupuesto.IdUsuarioAsigna = ${CurrentUser}`);

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
  WHERE Reasignaciones.IdUsuarioRecibe = ${CurrentUser}`);
    return { Asignaciones, Reasignaciones };

}
comprobacionDeGastosModel.getAsignadas = async(CurrentUser) => {
    /*const ComprobacionesDeGastos = await pool.query(`
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
  `);*/

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
WHERE AsignacionPresupuesto.IdUsuarioRecibe = ${CurrentUser}`);

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
WHERE Reasignaciones.IdUsuarioRecibe = ${CurrentUser}`);
    return { Asignaciones, Reasignaciones };

}
comprobacionDeGastosModel.getComprobar = async(IdAsignacionPresupuesto, IdUsuario) => {
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
        //      Modal Reasignar Data
    const TipoAsignacion = await pool.query('SELECT * FROM TipoAsignacion')
    const Usuarios = await pool.query('SELECT  Usuarios.IdUsuario, Usuarios.Nombre,Usuarios.PrimerApellido,Cargos.Cargo FROM Usuarios INNER JOIN Cargos ON Usuarios.IdCargo = Cargos.IdCargo');
    const Obras = await pool.query('SELECT * FROM Obras')
    return { Contribuyentes, Obras, comprobaciones, AsignacionesPresupuesto, TipoAsignacion, ReasignacionesData, Usuarios };

}
comprobacionDeGastosModel.postComprobar = async(IdAsignacionPresupuesto, IdReasignacion, ComprobacionData, CurrentUser) => {

    const cajaChicaObj = await pool.query(`
    SELECT
        AsignacionPresupuesto.CajaChica,
        AsignacionPresupuesto.IdRecurso
    FROM AsignacionPresupuesto
    WHERE AsignacionPresupuesto.IdAsignacionPresupuesto =${IdAsignacionPresupuesto}`)

    const { CajaChica, IdRecurso } = cajaChicaObj[0];
    const newMonto = parseFloat((CajaChica - ComprobacionData.Gasto).toFixed(2), 10);

    if (newMonto === 0) {
        await pool.query(`CALL sp_UpdateAsignacionPresupuesto(${IdAsignacionPresupuesto},${IdRecurso});`)
    }

    const ComprobacionResult = await pool.query(`
   CALL AgregarGasto(${IdAsignacionPresupuesto}, ${ComprobacionData.Gasto}, '${ComprobacionData.Concepto}', '${ComprobacionData.URLDocumento}', ${ComprobacionData.IdRubro},'${ComprobacionData.FolioNotaFactura}', ${ComprobacionData.IdContribuyente}, ${newMonto}, ${CurrentUser},${IdReasignacion});
                 `)
    console.log(ComprobacionResult)

    return { ComprobacionResult };

}
comprobacionDeGastosModel.getDetallesComprobacion = async(IdAsignacionPresupuesto) => {

    const AsignacionesPresupuesto = await pool.query(`
    SELECT
  AsignacionPresupuesto.IdTipoAsignacion,
  AsignacionPresupuesto.Fecha,
  AsignacionPresupuesto.Monto,
  Usuarios_1.Nombre AS NombreAsigna,
  Usuarios_1.PrimerApellido AS PrimerApellidoAsigna,
  Cargos.Cargo AS CargoAsigna,
  Usuarios.Nombre AS NombreRecibe,
  Usuarios.PrimerApellido AS PrimerApellidoRecibe,
  Cargos_1.Cargo AS CargoRecibe,
  StatusAsignacionPresupuesto.StatusAsignacionPresupuesto,
  TipoAsignacion.TipoAsignacion,
  AsignacionPresupuesto.IdAsignacionPresupuesto,
  AsignacionPresupuesto.CajaChica,
  AsignacionPresupuesto.Observacion
FROM AsignacionPresupuesto
  INNER JOIN Usuarios
    ON AsignacionPresupuesto.IdUsuarioRecibe = Usuarios.IdUsuario
  INNER JOIN StatusAsignacionPresupuesto
    ON AsignacionPresupuesto.IdStatusAsignacionPresupuesto = StatusAsignacionPresupuesto.IdStatusAsignacionPresupuesto
  INNER JOIN TipoAsignacion
    ON AsignacionPresupuesto.IdTipoAsignacion = TipoAsignacion.IdTipoAsignacion
  INNER JOIN Usuarios Usuarios_1
    ON AsignacionPresupuesto.IdUsuarioAsigna = Usuarios_1.IdUsuario
  INNER JOIN Cargos Cargos_1
    ON Usuarios.IdCargo = Cargos_1.IdCargo
  INNER JOIN Cargos
    ON Usuarios_1.IdCargo = Cargos.IdCargo
WHERE AsignacionPresupuesto.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}`);
    const AsignacionPresupuesto = AsignacionesPresupuesto[0];
    const ComprobacionesDeGasto = await pool.query(`
    SELECT
  Usuarios.Nombre,
  Usuarios.PrimerApellido,
  Cargos.Cargo,
  ComprobacionGastos.Concepto,
  Rubros.Rubro,
  ComprobacionGastos.Fecha,
  ComprobacionGastos.FolioNotaFactura,
  Contribuyentes.Contribuyente,
  ComprobacionGastos.Monto
FROM ComprobacionGastos
  INNER JOIN Usuarios
    ON ComprobacionGastos.IdUsuarioComprueba = Usuarios.IdUsuario
  INNER JOIN Cargos
    ON Usuarios.IdCargo = Cargos.IdCargo
  INNER JOIN Rubros
    ON ComprobacionGastos.IdRubro = Rubros.IdRubro
  INNER JOIN Contribuyentes
    ON ComprobacionGastos.IdContribuyente = Contribuyentes.IdContribuyente
WHERE ComprobacionGastos.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}`);
    const Reasignaciones = await pool.query(`
    SELECT
    Reasignaciones.IdReasignacion,
    Usuarios.Nombre AS NombreAsigna,
    Usuarios.PrimerApellido AS PrimerApellidoAsigna,
    Cargos.Cargo AS CargoAsigna,
    Usuarios_1.Nombre AS NombreRecibe,
    Usuarios_1.PrimerApellido AS PrimerApellidoRecibe,
    Cargos_1.Cargo AS CargoRecibe,
    Reasignaciones.CajaChica,
    Reasignaciones.FECHA,
    Reasignaciones.Observacion,
    Reasignaciones.MontoAsignado,
    TipoAsignacion.TipoAsignacion
  FROM Reasignaciones
    INNER JOIN Usuarios
      ON Reasignaciones.IdUsuarioAsigna = Usuarios.IdUsuario
    INNER JOIN Cargos
      ON Usuarios.IdCargo = Cargos.IdCargo
    INNER JOIN Usuarios Usuarios_1
      ON Reasignaciones.IdUsuarioRecibe = Usuarios_1.IdUsuario
    INNER JOIN Cargos Cargos_1
      ON Usuarios_1.IdCargo = Cargos_1.IdCargo
    INNER JOIN TipoAsignacion
      ON Reasignaciones.IdTipoAsignacion = TipoAsignacion.IdTipoAsignacion
  WHERE Reasignaciones.IdAsignacionPresupuesto = ${IdAsignacionPresupuesto}`);
    var totalGastos = 0;
    ComprobacionesDeGasto.forEach(function getTotal(element, index, array) {
        totalGastos = totalGastos + array[index].Monto;
        //console.log(array[index].Monto);
    })
    return { AsignacionPresupuesto, ComprobacionesDeGasto, totalGastos, Reasignaciones };
}


module.exports = comprobacionDeGastosModel;
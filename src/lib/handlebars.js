const { format } = require('timeago.js')
const { FormatMoney } = require('format-money-js');
const dateFormat = require("dateformat");
dateFormat.i18n = {
    dayNames: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
        "Domingo",
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
    ],
    monthNames: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
};
const helpers = {};

helpers.timeago = (timestamp) => {
    return format(timestamp, 'right now');
};
helpers.EqualsTo = (value1, value2) => {
    if (value1 == value2) {
        return true;
    } else {
        return false;
    }
};
helpers.FormatDate = (timestamp) => {

    return dateFormat(timestamp, "default");
};
helpers.ShortFormatDate = (timestamp) => {

    return dateFormat(timestamp, "d/m/yyyy");
};
helpers.GetIva = (mount) => {

    return helpers.FMoney(mount * 0.16);
};
helpers.FMoney = (money) => {
    const fm = new FormatMoney({
        decimals: 2
    });
    return fm.from(money, { symbol: '$' });
};
helpers.getTotalMoneyMount = (data) => {
    var totalSuma = 0;
    data.forEach(function getTotal(element, index, array) {
        totalSuma = totalSuma + array[index].Monto;
        //console.log(array[index].Monto);
    })
    return helpers.FMoney(totalSuma);
};
helpers.statusRegistro = (status) => {
    switch (status) {
        case 'No asignado':
            return 'bg-secondary'
            break;
        case 'No comprobado':
            return 'bg-warning text-dark'
            break;
    }
};

helpers.btnAsignado = (status) => {
    switch (status) {
        case 'No asignado':
            return true
            break;
        case 'No comprobado':
            return false
            break;
    }
};

/// Frontend permitions for routes
helpers.authForRecursos = (IdCargo) => {
    switch (IdCargo) {
        case 1:
            return true;
            break;
        case 2:
            return true;
            break;
        case 3:
            return true;
            break;

        default:
            break;
    }
};
helpers.authForAddUsers = (IdCargo) => {
    switch (IdCargo) {
        case 1:
            return true;
            break;
        case 2:
            return true;
            break;
        case 3:
            return true;
            break;

        default:
            break;
    }
};

module.exports = helpers;
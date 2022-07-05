const bcrypt = require('bcryptjs');
const pool = require('../database');
const { FormatMoney } = require('format-money-js');
const helpers = {};

helpers.encrypPassword = async(password) => {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}
helpers.isIntNull = (property) => {
    if (property) {
        return property
    } else {
        return null
    }
}
helpers.isIntZero = (property) => {
    if (property) {
        return property
    } else {
        return 0
    }
}
helpers.isStringNull = (property) => {
    if (property === '') {
        return null
    } else {
        return property
    }
}
helpers.FMoney = (money) => {
    const fm = new FormatMoney({
        decimals: 2
    });
    return fm.from(money, { symbol: '$' });
};

helpers.matchPassword = async(password, savedPassword) => {
    try {
        /*  console.log(password)
          console.log(savedPassword)*/
        return await bcrypt.compare(password, savedPassword);
    } catch (e) {
        console.log(e)
    }
};

helpers.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
};
helpers.fillForm = (req, res, next) => {

    return res.redirect('/');
};

/// Backend permitions for routes
helpers.authForRecursos = (req, res, next) => {
    if (req.isAuthenticated()) {
        switch (req.session.passport.user.IdCargo) {
            case 1:
                return next();
                break;
            case 2:
                return next();
                break;
            case 3:
                return next();
                break;

            default:
                break;
        }

    }
    return res.redirect('/');
};
helpers.authForComprobacionDeGastos = (req, res, next) => {
    if (req.isAuthenticated()) {
        switch (req.session.passport.user.IdCargo) {
            case 1:
                return next();
                break;
            case 2:
                return next();
                break;
            case 3:
                return next();
                break;
            case 4:
                return next();
                break;

            case 5:
                return next();
                break;


            default:
                break;
        }

    }
    return res.redirect('/');
};
helpers.authForSingUp = (req, res, next) => {
    if (req.isAuthenticated()) {
        switch (req.session.passport.user.IdCargo) {
            case 1:
                return next();
                break;
            case 2:
                return next();
                break;
            case 3:
                return next();
                break;
            case 4:
                return next();
                break;
            default:
                break;
        }

    }
    return res.redirect('/');
};

module.exports = helpers;
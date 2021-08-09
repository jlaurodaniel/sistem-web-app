const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signup', new LocalStrategy({
    usernameField: 'User',
    passwordField: 'Password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    console.log(req.body);
    console.log(username);
    console.log(password);
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'User',
    passwordField: 'Password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM Usuarios WHERE NombreUsuario = ?', [username]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.HashPassword)
        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome ' + user.NombreUsuario));
        } else {
            done(null, false, req.flash('message', 'Incorrect Password'));
        }
    } else {
        return done(null, false, req.flash('message', 'The Username does not exists.'));
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async(id, done) => {
    //const rows = await pool.query('SELECT * FROM Usuarios WHERE NombreUsuario = ?', [id]);
    done(null, id);
});
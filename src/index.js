const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require("passport");
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const fileUpload = require('express-fileupload')

const { database } = require('./keys');

//Initializations
const app = express();
require('./lib/passport')

//settings
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');
//Midlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'gruposistemapp',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, '/src/storage/comprobantesRecursos')
}));


//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//Routes
app.use('/', require('./routes/index.js'));
app.use('/auth', require('./routes/auth'));
app.use('/cheques', require('./routes/cheques.js'));
app.use('/dashboard', require('./routes/dashboard.js'));
app.use('/comprobacionDeGastos', require('./routes/comprobacionDeGastos'));

//Public
app.use(express.static(path.join(__dirname, 'public')));


//run server
app.listen(app.get('port'), () => {
    console.log('Running at port ' + app.get('port'));

});
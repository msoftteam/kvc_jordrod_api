var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('./config/config');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var UserController = require('./controllers/UserController');
var DriverController = require('./controllers/DriverController');

var PORT = process.env.PORT || 3000;

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(morgan('dev'));

app.use(passport.initialize());
require('./config/passport')(passport);

var apiRoutes = express.Router();

io.on('connection', function(socket) {
	console.log('User connected via socket.io!');
});

apiRoutes.get('/', passport.authenticate('jwt', { session: false }), function(req, res) {
  //res.send('Hello World');
  res.json({greeting: 'Hello World'});
});

// ########################### User ###############################
apiRoutes.post('/user/register', UserController.register);
apiRoutes.post('/user/authenticate', UserController.authenticate);
apiRoutes.get('/user/findAll', passport.authenticate('jwt', { session: false }), UserController.findAll);
apiRoutes.post('/user/findById', passport.authenticate('jwt', { session: false }), UserController.findById);
apiRoutes.post('/user/update', passport.authenticate('jwt', { session: false }), UserController.update);
apiRoutes.post('/user/delete', passport.authenticate('jwt', { session: false }), UserController.delete);

// ########################### Driver ###############################
apiRoutes.post('/driver/register', passport.authenticate('jwt', { session: false }), DriverController.register);

app.use('/api', apiRoutes);

http.listen(PORT, function() {
	console.log('server running on port ' + PORT);
});

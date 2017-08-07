var mysql = require('mysql');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var config = require('./config');
var dbconfig = require('./database');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    connection.query("SELECT * FROM users WHERE id = ?", [jwt_payload.id], function(err, result) {
      if (err) {
        console.log(err);
        return done(err, false);
      }
      if (result) {
        done(null, result);
      } else {
        done(null, false);
      }
    });

  }));
};

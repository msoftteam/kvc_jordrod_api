var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

var sql = 'INSERT INTO ' + dbconfig.database + '.' + dbconfig.role_table + '(role_name) VALUES ?';

var values = [
    ['ADMIN'],
    ['USER']
];

connection.query(sql, [values], function(err, result) {
    if (err) throw err;
    console.log(result);
});

console.log('insert data success');
connection.end();
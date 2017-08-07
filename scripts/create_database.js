var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database + ' CHARACTER SET utf8 COLLATE utf8_general_ci ');

connection.query('\
CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.role_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `role_name` VARCHAR(20) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');

connection.query('\
CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
    `role_id` INT UNSIGNED NOT NULL, \
    `driver_name` VARCHAR(255), \
    `tel` VARCHAR(50), \
    `car_register_id` VARCHAR(100), \
    `car_color` VARCHAR(100), \
    `car_brand` VARCHAR(255), \
    `car_model` VARCHAR(100), \
    PRIMARY KEY (`id`), \
    FOREIGN KEY (`role_id`) \
    REFERENCES `' + dbconfig.database + '`.`' + dbconfig.role_table + '`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT, \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
) ENGINE=InnoDB');

console.log('Success: Database Created!')

connection.end();
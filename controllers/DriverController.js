var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var dbconfig = require('../config/database');
var path = require('path');
var multer  = require('multer');
var MulterResizer = require('multer-resizer');
var moment = require('moment');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    //cb(null, Date.now() + '_' + file.originalname);
		var ext = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
		cb(null, Date.now() + "." + ext);
  }
});

const resizer = new MulterResizer({
    multer: multer({storage: storage}),
    tasks: [
        {
            resize: {
                width: 400,
                height: 400,
                suffix: 'resized',
								format: 'png'
            }
        }
    ]
}).single('image_profile');

module.exports.register = function(req, res) {
	resizer(req, res, function(err) {
		console.log(req.body);
		console.log(req.file);

		if (err) {
			// erro when file upload not found
			console.log(new Error(err).message);
			//res.json(new Error(err).message);
		}

		var newDriver = {
			car_register_id: req.body.car_register_id,
			prefix: req.body.prefix,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			mobile_phone: req.body.mobile_phone,
			remark: req.body.remark,
      active_status: req.body.active_status,
      disabled_work_send: req.body.disabled_work_send,
			channel_receive_work: req.body.channel_receive_work,
			cr_by: req.body.cr_by
		};

		if (req.file) {
			var fileName = req.file.filename;
			//var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
			var newFileName = fileName.substr(0, fileName.lastIndexOf('.'));
			newDriver.image_profile = newFileName + "_resized.png";

			// delete original file
			var linkToDelete = path.join(__dirname, '..', req.file.path);
			console.log('link to delete file: ' + linkToDelete);
			fs.unlinkSync(linkToDelete);
		} else {
			newDriver.image_profile = "";
		}

    var sql = "INSERT INTO drivers(car_register_id, image_profile, prefix, first_name, last_name, mobile_phone, remark, active_status, disabled_work_send, channel_receive_work, cr_by, upd_by) VALUES (?, ? ,?, ?, ?, ?, ?, ?, ?, ? ,?, ?) ";

    connection.query(sql,
      [newDriver.car_register_id, newDriver.image_profile, newDriver.prefix, newDriver.first_name, newDriver.last_name, newDriver.mobile_phone, newDriver.remark, newDriver.active_status, newDriver.disabled_work_send, newDriver.channel_receive_work, newDriver.cr_by, newDriver.cr_by],
      function(err, result) {
      if (err) {
        console.log(err); // new Error(err).message
        return res.json({
          success: false,
          //message: 'Can\'t insert new user.'
          message: new Error(err).message
        });
      }

      res.json({
        success: true,
        message: 'Successfully created new driver.'
      });
    });

	});

};

module.exports.findAll = function(req, res) {
	var sql = '\
		SELECT \
			u.id, \
			u.username, \
			r.role_name, \
			u.image_profile, \
			u.prefix, \
			u.first_name, \
			u.last_name, \
			u.mobile_phone, \
			u.facebook_id, \
			u.line_id \
		FROM users as u \
		LEFT JOIN user_role as r ON u.role_id = r.id \
		ORDER BY u.id ASC \
	';
	connection.query(sql, function(err, results) {
		if (err) {
			console.log(err);
			res.send({
				success: false,
				message: new Error(err).message
			});
		} else {

			for (var i = 0; i < results.length; i++) {
				if (results[i].image_profile) {
					results[i].image_url = 'http://' + req.headers.host + '/uploads/' + results[i].image_profile;
				} else {
					results[i].image_url = '';
				}
			}

			res.json({
				success: true,
				records_size: results.length,
				data: results
			});
		}
	});
};

module.exports.findById = function(req, res) {
	var sql = '\
		SELECT \
			u.id, \
			u.username, \
			u.role_id, \
			u.image_profile, \
			u.prefix, \
			u.first_name, \
			u.last_name, \
			u.mobile_phone, \
			u.facebook_id, \
			u.line_id \
		FROM users as u \
		WHERE u.id = ? \
	';

	connection.query(sql, [req.body.id], function(err, results) {
		if (err) {
			console.log(err);
			res.send({
				success: false,
				message: new Error(err).message
			});
		} else if (!err && results.length === 0) {
			res.send({
				success: false,
				message: "Driver not found."
			});
		} else {
			if (results[0].image_profile) {
				results[0].image_url = 'http://' + req.headers.host + '/uploads/' + results[0].image_profile;
			} else {
				results[0].image_url = '';
			}
			res.json({
				success: true,
				data: results[0]
			});
		}
	});

};

module.exports.update = function(req, res) {
  resizer(req, res, function(err) {
		console.log(req.body);
		console.log(req.file);

		if (err) {
			// erro when file upload not found
			console.log(new Error(err).message);
			//res.json(new Error(err).message);
		}

		var newUser = {
      id: req.body.id,
			username: req.body.username,
			password: req.body.password,
			role_id: req.body.role_id,
	    //image_profile: req.file.filename,
			prefix: req.body.prefix,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			mobile_phone: req.body.mobile_phone,
			facebook_id: req.body.facebook_id,
			line_id: req.body.line_id,
			cr_by: req.body.cr_by
		};



    console.log(newUser);

    connection.query("SELECT * FROM users WHERE id = ? ", [newUser.id], function(err, results) {
      if (err) {
  			console.log(err);
  			res.send({
  				success: false,
  				message: new Error(err).message
  			});
  		} else if (!err && results.length === 0) {
  			res.send({
  				success: false,
  				message: "User not found."
  			});
  		} else {
        var data = results[0];

        if (req.file) {
    			var fileName = req.file.filename;
    			//var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
    			var newFileName = fileName.substr(0, fileName.lastIndexOf('.'));
    			newUser.image_profile = newFileName + "_resized.png";

    			// delete original file
    			var linkToDelete = path.join(__dirname, '..', req.file.path);
    			console.log('link to delete file: ' + linkToDelete);
    			fs.unlinkSync(linkToDelete);
    		} else {
    			newUser.image_profile = "";
    		}

        //res.json(data);
        if (!newUser.username) {
          newUser.username = data.username;
        }

        if (!newUser.role_id) {
          newUser.role_id = data.role_id;
        }

        if (!newUser.prefix) {
          newUser.prefix = data.prefix;
        }

        if (!newUser.first_name) {
          newUser.first_name = data.first_name;
        }

        if (!newUser.last_name) {
          newUser.last_name = data.last_name;
        }

        if (!newUser.mobile_phone) {
          newUser.mobile_phone = data.mobile_phone;
        }

        if (!newUser.facebook_id) {
          newUser.facebook_id = data.facebook_id;
        }

        if (!newUser.line_id) {
          newUser.line_id = data.line_id;
        }

        // ถ้า image profile ว่าง ให้ set ภาพเดิม
        if (newUser.image_profile === '') {
          newUser.image_profile = data.image_profile;
        }

        var updDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        if (!newUser.password) {
          newUser.password = data.password;

          // update
          var sql = "UPDATE users SET username = ?, password = ?, role_id = ?, image_profile = ?, prefix = ?, first_name = ?, last_name = ?, mobile_phone = ?, facebook_id = ?, line_id = ?, upd_by = ?, upd_date = ? WHERE id = ? ";
          connection.query(sql,
            [newUser.username, newUser.password, newUser.role_id, newUser.image_profile, newUser.prefix, newUser.first_name, newUser.last_name, newUser.mobile_phone, newUser.facebook_id, newUser.line_id, newUser.cr_by, updDate, newUser.id],
            function(err, result) {
            if (err) {
              console.log(err); // new Error(err).message
              return res.json({
                success: false,
                //message: 'Can\'t insert new user.'
                message: new Error(err).message
              });
            }

            res.json({
              success: true,
              message: 'Successfully update user.'
            });
          });

        } else {
          bcrypt.genSalt(10, function(err, salt) {
      	    if (err) {
      	      return res.json({
      					success: false,
      					message: 'Can\'t genSalt for hash password.'
      				});
      	    }
      	    bcrypt.hash(newUser.password, salt, function(err, hash) {
      	      if (err) {
      	        console.log(err);
      	        return res.json({
      	  				success: false,
      	  				message: 'Can\'t hash password.'
      	  			});
      	      }
      	      newUser.password = hash; // set hash password to newUser Object

      	      //console.log('user password : ' + newUser.password);
      	      // update
              var sql = "UPDATE users SET username = ?, password = ?, role_id = ?, image_profile = ?, prefix = ?, first_name = ?, last_name = ?, mobile_phone = ?, facebook_id = ?, line_id = ?, upd_by = ?, upd_date = ? WHERE id = ? ";
      	      connection.query(sql,
      	        [newUser.username, newUser.password, newUser.role_id, newUser.image_profile, newUser.prefix, newUser.first_name, newUser.last_name, newUser.mobile_phone, newUser.facebook_id, newUser.line_id, newUser.cr_by, updDate, newUser.id],
      	        function(err, result) {
      	        if (err) {
      	          console.log(err); // new Error(err).message
      	          return res.json({
      	    				success: false,
      	    				//message: 'Can\'t insert new user.'
      							message: new Error(err).message
      	    			});
      	        }

      	        res.json({
      	    			success: true,
      	    			message: 'Successfully update user.'
      	    		});
      	      });

      	    });
      	  });

        }
      }
    });

	});
};

module.exports.delete = function(req, res) {
  console.log(req.body);
  var linkToDelete = path.join(__dirname, '..', 'uploads', req.body.image_profile);
  if (fs.existsSync(linkToDelete)) {
    fs.unlinkSync(linkToDelete);
  }

  connection.query("DELETE FROM users WHERE id = ? ", [req.body.id], function(err, result) {
    if (err) {
      console.log(err); // new Error(err).message
      return res.json({
        success: false,
        //message: 'Can\'t insert new user.'
        message: new Error(err).message
      });
    } else {
      res.json({
        success: true,
        message: 'Successfully delete user.'
      });
    }
  });
};

var db = require('../../utils/database');
var md5 = require('md5');
var utils = require('../../utils/index');
var config = require('../../src/config');
const nodemailer = require('nodemailer');
let transport = nodemailer.createTransport(config.smtp);
var moment = require("moment")
const OneSignal = require('onesignal-node');    
const { param } = require('../app');
const { EmptyResultError } = require('sequelize');
const client = new OneSignal.Client('c167fc9d-d6ff-41e0-bd84-05a10c074219', 'ZjkxN2MyYmMtOGVkZi00YTRlLWI0ZmEtY2Y0OWNlZmYzZTI2');
const fs = require('fs');

var client_signup = async function (params) {
    let car_picture = params['faceImg'] ? Date.now()+'_face.jpg' : null
    let license_front = params['frontImg'] ? Date.now()+'_front.jpg' : null
    let license_back = params['backImg'] ? Date.now()+'_back.jpg' : null
    if(params['faceImg'])
        await fs.writeFile('./public/uploads/'+car_picture, params['faceImg'], 'base64', (err) => {
            if (err) console.log(err)
        })

    if(params['backImg'])
        await fs.writeFile('./public/uploads/'+license_back, params['backImg'], 'base64', (err) => {
            if (err) console.log(err)
        })

    var insert_fields = [
        'user', 'password', 'email', 'phone', 'country', 'type', 'phone_code', 'kind', 'car_color', 'plate_no', 'is_online', 'car_picture', 'license_front', 'license_back'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    
    var insert_vals = [
        "'" + params['user'] + "'",
        "'" + params['password'] + "'",
        "'" + params['email'] + "'",
        "'" + params['phone'] + "'",
        "'" + params['country'] + "'",
        "'" + params['type'] + "'",
        "'" + params['phone_code'] + "'",
        "'" + params['kind'] + "'",
        "'" + params['car_color'] + "'",
        "'" + params['plate_no'] + "'",
        "'0'",
        "'" + car_picture + "'",
        "'" + license_front + "'",
        "'" + license_back + "'"
    ]

    return db.list("SELECT * FROM tb_user where email = '"+params['email']+"' or user = '"+params['user']+"'").then((r) => {
        
        if(r.length > 0) {
            return false;
        }
        return db.list(db.statement('insert into', 'tb_user', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then((row) =>{
            /*transport.sendMail(message, function(err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            });*/
            return true;
        })
    });
    
}

var login = function (params) {
    if(params['user'] != 'admin')
        return db.list("SELECT * FROM tb_user where user = '"+params['user']+"' and password = '"+params['password']+"' and type = "+params['type']+"").then((r) => {
            if(r.length > 0) {
                db.cmd("UPDATE tb_user SET token = '"+params['token']+"' WHERE id="+r[0]['id'])
                return r[0];
            } else {
                return false;
            }
        });
    else {
        return db.list("SELECT * FROM tb_user where user = '"+params['user']+"' and password = '"+params['password']+"'").then((r) => {
            if(r.length > 0) {
                return r[0];
            } else {
                return false;
            }
        });
    }
}

var contactus = function (params) {
    var insert_fields = [
        'email', 'title', 'description'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    var insert_vals = [
        "'" + params['email'] + "'",
        "'" + params['title'] + "'",
        "'" + params['description'] + "'"
    ]
    return db.list(db.statement('insert into', 'tb_contact_us', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then((row) =>{
        let message = {
            from : 'Taxiwait ' + config.smtp.auth.user,
            to: 'venicesun@hotmail.com',
            subject: params['title'],
            text: params['description']
        }
        transport.sendMail(message, function(err, info) {
            if (err) {
                console.log('error', err)
            } else {
                console.log('success', info);
            }
        });
        return true;
    })
    
}

var get_user_info = function (params) {
    
    return db.list("SELECT * FROM tb_user where id = "+params['id']).then((r) => {
        if(r.length > 0) {
            return r[0];
        } else {
            return false;
        }
        
    });
    
}

var update_profile = async function (params) {
    let car_picture = params['faceImg'] ? Date.now()+'_face.jpg' : null
    let license_front = params['frontImg'] ? Date.now()+'_front.jpg' : null
    let license_back = params['backImg'] ? Date.now()+'_back.jpg' : null
    if(params['faceImg'])
        await fs.writeFile('./public/uploads/'+car_picture, params['faceImg'], 'base64', (err) => {
            if (err) console.log(err)
        })
    if(params['frontImg'])
        await fs.writeFile('./public/uploads/'+license_front, params['frontImg'], 'base64', (err) => {
            if (err) console.log(err)
        })
    if(params['backImg'])
        await fs.writeFile('./public/uploads/'+license_back, params['backImg'], 'base64', (err) => {
            if (err) console.log(err)
        })

    if(params['password']) {
        var sql = "";
        sql = "UPDATE tb_user SET user = '"+params['user']+"', password = '"+params['password']+"', email = '"+params['email']+"', phone='"+params['phone']+"', country='"+params['country']+"', phone_code='"+params['phone_code']+"', kind='"+params['kind']+"', car_color='"+params['car_color']+"', plate_no='"+params['plate_no']+"' ";
        if(car_picture)
            sql += " car_picture='"+car_picture+"' ";
        if(license_front)
            sql += " license_front = '"+license_front+"' ";
        if(license_back)
            sql += " license_back = '"+license_back+"' ";

        sql += " WHERE id = "+params['id'];
        return db.list(sql).then((r) => {
            return db.list("SELECT * from tb_user where id = "+params['id']).then((row) => {
                if(row.length > 0)
                    return row[0];
                else
                    return false;
            })
        });
    }
    else {
        var sql = "";
        sql = "UPDATE tb_user SET user = '"+params['user']+"', email = '"+params['email']+"', phone='"+params['phone']+"', country='"+params['country']+"', phone_code='"+params['phone_code']+"', kind='"+params['kind']+"', car_color='"+params['car_color']+"', plate_no='"+params['plate_no']+"' ";
        if(car_picture)
            sql += " ,car_picture='"+car_picture+"' ";
        if(license_front)
            sql += " ,license_front = '"+license_front+"' ";
        if(license_back)
            sql += " ,license_back = '"+license_back+"' ";
        sql += " WHERE id = "+params['id'];

        return db.list(sql).then((r) => {
            return db.list("SELECT * from tb_user where id = "+params['id']).then((row) => {
                if(row.length > 0)
                    return row[0];
                else
                    return false;
            })
        });
    }
}

var update_payment = function (params) {
    
    return db.list("UPDATE tb_user SET payment = "+params['payment']+" WHERE id = "+params['id']).then((r) => {
        return true;
    });
    
}

var upload_face_picture = function (params) {
    console.log('here', params)
}

var support = function (params) {
    var insert_fields = [
        'email', 'title', 'description'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    var insert_vals = [
        "'" + params['email'] + "'",
        "'" + params['title'] + "'",
        "'" + params['description'] + "'"
    ]
    return db.list(db.statement('insert into', 'tb_contact_us', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then((row) =>{
        let message = {
            from : params['sender_name'],
            to: params['email'],
            subject: params['title'],
            text: params['description']
        }
        transport.sendMail(message, function(err, info) {
            if (err) {
                console.log('error', err)
            } else {
                console.log('success', info);
            }
        });
        return true;
    })
}

var add_booking = function (params) {
    var insert_fields = [
        'user_id', 'distance', 'price', 'currency', 'total_time', 'status', 'create_time', 'update_time'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    
    var insert_vals = [
        "'" + params['user_id'] + "'",
        "'" + params['distance'] + "'",
        "'" + params['price'] + "'",
        "'" + params['currency'] + "'",
        "'" + params['totalTime'] + "'",
        "'0'",
        "'"+moment().format("YYYY-MM-DD HH:mm:ss")+"'",
        "'"+moment().format("YYYY-MM-DD HH:mm:ss")+"'",
    ]
    
    return db.list(db.statement('insert into', 'tb_booking', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then(async (row) =>{
        if(row && params['bookingList'] && params['bookingList'].length > 0) {
            
            for(var j = 0;j< params['bookingList'].length;j++) {
                var insert_fields1 = [
                    'lat', 'lng', 'place', 'booking_id'
                ]
                for (var i = 0; i < insert_fields1.length; i++) {
                    insert_fields1[i] = '`' + insert_fields1[i] + '`'
                }
                
                var insert_vals1 = [
                    "'" + params['bookingList'][j][0] + "'",
                    "'" + params['bookingList'][j][1] + "'",
                    "'" + params['bookingList'][j][2] + "'",
                    "'" + row.insertId + "'"
                ]
                db.list(db.statement('insert into', 'tb_locations', '(' + insert_fields1.join(',') + ')', '', 'VALUES (' + insert_vals1.join(',') + ')'))
            }
            
            
            db.list("SELECT * FROM tb_user where is_online=1 and type = 0 and is_busy != 1").then(async (r) => {
                if(r && r.length > 0) {
                    for(var p = 0;p<r.length;p++) {
                        if(r[p]['token']) {
                            const notification = {
                                contents: {
                                    'en': 'One client want to book the taxi',
                                },
                                headings: {
                                    'en': 'A new reservation!',
                                },
                                include_player_ids: [r[p]['token']],
                                data: {"booking_id": row.insertId, "type" : "request"}
                            };
                            client.createNotification(notification);
                        }
                    }
                }
            })
            
        }
        return true;
    })
}


var get_booking_list = function (params) {
    return db.list("select * from tb_user where id = "+params['user_id']).then(async (row) => {
        if(row[0]['is_online'])
            return db.list("SELECT tb_booking.* , tb_user.phone, tb_user.phone_code FROM tb_booking left join tb_user on tb_user.id = tb_booking.user_id and tb_user.is_online=1 where (tb_booking.status = 1 and tb_booking.driver_id = "+params['user_id']+") or tb_booking.status = 0 ORDER BY tb_booking.create_time desc").then(async (r) => {
                if(r.length > 0) {
                    for(var i = 0;i<r.length;i++) {
                        r[i]['locations'] = []
                        await db.list("select * from tb_locations where booking_id = "+r[i]['id']).then((row) => {
                            if(row.length > 0) {
                                r[i].locations = row
                            }
                        })
                    }
                    return r;
                } else {
                    return false;
                }
                
            });
        else
            return [];
    })
    
}

var get_booking_info = function (params) {
    
    return db.list("SELECT tb_booking.* , tb_user.phone, tb_user.phone_code, tb_user.user FROM tb_booking left join tb_user on tb_user.id = tb_booking.user_id where tb_booking.id = "+params['booking_id']+" ORDER BY tb_booking.create_time desc").then(async (r) => {
        if(r.length > 0) {
            for(var i = 0;i<r.length;i++) {
                r[i]['locations'] = []
                await db.list("select * from tb_locations where booking_id = "+r[i]['id']).then((row) => {
                    if(row.length > 0) {
                        r[i].locations = row
                    }
                })
            }
            return r;
        } else {
            return false;
        }
        
    });
}

var accept = function (params) {
    return db.list("select tb_booking.*, tb_user.token, tb_user.phone, tb_user.phone_code, tb_user.user from tb_booking left join tb_user on tb_user.id = tb_booking.user_id where tb_booking.id = "+params['booking_id']).then((row) => {
        if(row[0]['status'] != 0) {
            return false;
        } else {
            db.list("select * from tb_user where id = "+params['driver_id']).then((_row) => {
                if(_row[0]) {
                    if(row[0]['token']) {
                        const notification = {
                            contents: {
                                'en': 'One driver has accepted your request!',
                            },
                            headings: {
                                'en': 'Driver Accepted',
                            },
                            include_player_ids: [row[0]['token']],
                            data: {"booking_id": params['booking_id'], "driver_id" : params['driver_id'], "type" : "driver accept", "phone" : _row[0]['phone_code']+_row[0]['phone'], "user_name" : row[0]['user']}
                        };
                        client.createNotification(notification);
                    }
                }
            })
            
            
            return db.list("UPDATE tb_booking SET driver_id = "+params['driver_id']+", status=1 WHERE id = "+params['booking_id']).then((r) => {
                return true;
            });
        }
    })  
}

var finish = function (params) {
    return db.list("UPDATE tb_booking SET status = 2 WHERE id = "+params['booking_id']).then((r) => {

        return db.list("SELECT tb_user.* from tb_booking left join tb_user on tb_user.id = tb_booking.user_id where tb_booking.id = "+params['booking_id']).then((row) => {
            if(row.length > 0 ) {
                if(row[0]['token']) {
                    const notification = {
                        contents: {
                            'en': 'Thank you and we hoppe to see you again.',
                        },
                        headings: {
                            'en': 'Finish Reservation!',
                        },
                        include_player_ids: [row[0]['token']],
                        data: {"type" : "finish"}
                    };
                    client.createNotification(notification);
                }
            }
            return true;
        });
       
    });
}

var notify = function (params) {
    return db.list("SELECT tb_user.* from tb_booking left join tb_user on tb_user.id = tb_booking.user_id where tb_booking.id = "+params['booking_id']).then((row) => {
        if(row.length > 0 ) {
            if(row[0]['token']) {
                const notification = {
                    contents: {
                        'en': 'Your driver has arrived now  and waiting you.',
                    },
                    headings: {
                        'en': 'Driver Arrived!',
                    },
                    include_player_ids: [row[0]['token']],
                    data: {"booking_id": row.insertId, "type" : "driver arrived"}
                };
                client.createNotification(notification);
            }
            
            return true;
        } else {
            return false;
        }
    });
}

var cancel_booking = function (params) {
    return db.list("UPDATE tb_booking SET status = 3 WHERE id = "+params['booking_id']).then((r) => {
        return db.list("SELECT tb_user.* from tb_booking left join tb_user on tb_user.id = tb_booking.driver_id where tb_booking.id = "+params['booking_id']).then((row) => {
            if(row[0] && row[0]['token']) {
                const notification = {
                    contents: {
                        'en': 'Your guest has cancelled the reservation.',
                    },
                    headings: {
                        'en': 'Reservation Cancel',
                    },
                    include_player_ids: [row[0]['token']],
                    data: {"booking_id": params['booking_id'], "type" : "reservation cancel"}
                };
                client.createNotification(notification);
            }
            return true;
        });
    });
}

var set_online = function (params) {
    return db.list("UPDATE tb_user SET is_online = "+params['on_off']+" WHERE id = "+params['driver_id']).then((r) => {
        return true;
    });
}

var is_favorite_driver = function (params) {
    return db.list("SELECT * from tb_favorite where driver_id = "+params['driver_id']+" and client_id = "+params['user_id']).then((row) => {
        if(row.length > 0 ) {
            return row[0];
        } else {
            return false;
        }
    });
}

var rating_driver = function (params) {
    var insert_fields = [
        'driver_id', 'client_id', 'rating'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    
    var insert_vals = [
        "'" + params['driver_id'] + "'",
        "'" + params['client_id'] + "'",
        "'" + params['star'] + "'"
    ]
    
    return db.list(db.statement('insert into', 'tb_ratings', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then((row) =>{
        
        return true;
    })
}

var favorite_driver = function (params) {
    var insert_fields = [
        'driver_id', 'client_id'
    ]
    for (var i = 0; i < insert_fields.length; i++) {
        insert_fields[i] = '`' + insert_fields[i] + '`'
    }
    
    var insert_vals = [
        "'" + params['driver_id'] + "'",
        "'" + params['client_id'] + "'",
    ]
    
    return db.list(db.statement('insert into', 'tb_favorite', '(' + insert_fields.join(',') + ')', '', 'VALUES (' + insert_vals.join(',') + ')')).then((row) =>{
        
        return true;
    })
}

var get_driver_list = function (params) {
    return db.list("SELECT tb_user.id, tb_user.user, tb_user.kind, tb_user.car_color, tb_user.plate_no, tb_user.car_picture, tb_favorite.client_id as is_favorite, tb_ratings.client_id, AVG(tb_ratings.rating) as rating, COUNT(tb_ratings.rating) as cnt FROM tb_user left join tb_favorite on tb_favorite.driver_id = tb_user.id and tb_favorite.client_id = "+params['client_id']+" left join tb_ratings on tb_ratings.driver_id = tb_user.id and tb_ratings.client_id = "+params['client_id']+" WHERE tb_user.type = 0 GROUP By tb_user.id").then(async (row) => {
        if(row.length > 0)
            return row;
        else
            return [];
    })
}

var get_driver_ratings = function (params) {
    return db.list("SELECT driver_id, FLOOR(AVG(rating)) as rating, COUNT(rating) as count FROM tb_ratings  WHERE driver_id = "+params['driver_id']+" GROUP BY driver_id").then(async (row) => {
        if(row.length > 0)
            return row;
        else
            return false;
    })
}

var send_chat = function (params) {
    if(params['type'] == '1') {
        return db.list("SELECT tb_user.*  FROM tb_booking LEFT JOIN tb_user ON tb_user.id = tb_booking.driver_id  WHERE tb_booking.id = "+params['booking_id']).then((row) => {
            if(row[0] && row[0]['token']) {
                const notification = {
                    contents: {
                        'en': params['message'],
                    },
                    headings: {
                        'en': 'New chat message',
                    },
                    include_player_ids: [row[0]['token']],
                    data: {"booking_id": params['booking_id'], "type" : "driver", "action" : "chat"}
                };
                client.createNotification(notification);
            }
            return true;
        });
    } else {
        return db.list("SELECT tb_user.*  FROM tb_booking LEFT JOIN tb_user ON tb_user.id = tb_booking.user_id  WHERE tb_booking.id = "+params['booking_id']).then((row) => {
            if(row[0] && row[0]['token']) {
                const notification = {
                    contents: {
                        'en': params['message'],
                    },
                    headings: {
                        'en': 'New chat message',
                    },
                    include_player_ids: [row[0]['token']],
                    data: {"booking_id": params['booking_id'], "type" : "client", "action" : "chat"}
                };
                client.createNotification(notification);
            }
            return true;
        });
    }
}

var get_driver_list_admin = function (params) {
    return db.list("SELECT * FROM tb_user  WHERE type = '0'").then(async (row) => {
        if(row.length > 0)
            return row;
        else
            return false;
    })
}

var remove_driver = function (params) {
    return db.list("Delete from tb_user  WHERE id = "+params['driver_id']+"").then(async (row) => {
        return true;
    })
}

var setOnOff = function (params) {
    
    return db.list("UPDATE tb_user SET is_online = "+params['on_off']+" WHERE id = "+params['driver_id']).then((r) => {
        return true;
    });
    
}

var forgot = function (params) {
    
    return db.list("UPDATE tb_user SET password = '"+params['password']+"' WHERE user = '"+params['user']+"'").then((r) => {
        if(r.affectedRows)
            return true;
        else
            return false;
    });
    
}

var model = {
    client_signup: client_signup,
    login: login,
    contactus: contactus,
    get_user_info: get_user_info,
    update_profile: update_profile,
    update_payment: update_payment,
    upload_face_picture: upload_face_picture,
    support: support,
    add_booking: add_booking,
    get_booking_list: get_booking_list,
    get_booking_info: get_booking_info,
    accept: accept,
    finish: finish,
    notify: notify,
    cancel_booking: cancel_booking,
    set_online: set_online,
    is_favorite_driver: is_favorite_driver,
    rating_driver: rating_driver,
    favorite_driver: favorite_driver,
    get_driver_list : get_driver_list,
    get_driver_ratings: get_driver_ratings,
    send_chat: send_chat,
    get_driver_list_admin: get_driver_list_admin,
    remove_driver: remove_driver,
    setOnOff: setOnOff,
    forgot: forgot
}

module.exports = model;

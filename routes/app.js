var express = require('express');
var router = express.Router();

var model = require('./model/app');

const multer = require('multer')
const fs = require('fs');
const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, '../public/uploads')
    },
    filename(req, file, callback) {
      callback(null, `${Date.now()}_${file.originalname}`)
    },
  })

const upload = multer({ dest: '/' })
router.post('/client_signup', async function (req, res) {
    var data = await model.client_signup(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/login', async function (req, res) {
    var data = await model.login(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/contactus', async function (req, res) {
    var data = await model.contactus(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});
router.post('/get_user_info', async function (req, res) {
    var data = await model.get_user_info(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/update_profile', async function (req, res) {
    var data = await model.update_profile(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/update_payment', async function (req, res) {
    var data = await model.update_payment(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/upload_face_picture', async function (req, res) {
    fs.writeFile('./public/uploads/'+Date.now()+'.jpg', req.body.imgString, 'base64', (err) => {
        if (err) console.log(err)
    })
    return res.json({
        code: 20000
    })
});

router.post('/support', async function (req, res) {
    var data = await model.support(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/add_booking', async function (req, res) {
    var data = await model.add_booking(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/get_booking_list', async function (req, res) {
    var data = await model.get_booking_list(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/get_booking_info', async function (req, res) {
    var data = await model.get_booking_info(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/accept', async function (req, res) {
    var data = await model.accept(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/finish', async function (req, res) {
    var data = await model.finish(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/notify', async function (req, res) {
    var data = await model.notify(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/decline', async function (req, res) {
    var data = await model.decline(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/cancel_booking', async function (req, res) {
    var data = await model.cancel_booking(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/set_online', async function (req, res) {
    var data = await model.set_online(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/is_favorite_driver', async function (req, res) {
    var data = await model.is_favorite_driver(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});


router.post('/rating_driver', async function (req, res) {
    var data = await model.rating_driver(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/favorite_driver', async function (req, res) {
    var data = await model.favorite_driver(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/get_driver_list', async function (req, res) {
    var data = await model.get_driver_list(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/get_driver_ratings', async function (req, res) {
    var data = await model.get_driver_ratings(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/send_chat', async function (req, res) {
    var data = await model.send_chat(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});


router.post('/get_driver_list_admin', async function (req, res) {
    var data = await model.get_driver_list_admin(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/remove_driver', async function (req, res) {
    var data = await model.remove_driver(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});

router.post('/setOnOff', async function (req, res) {
    var data = await model.setOnOff(req.body)
    return res.json({
        code: 20000,
        data: data
    })
});



module.exports = router;

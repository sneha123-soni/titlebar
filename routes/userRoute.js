const express = require("express");
const user_route = express();

const passport = require("passport");

const bodyParser = require("body-parser");   // data ko encode krne m use hoga
user_route.use(bodyParser.json()); 
user_route.use(bodyParser.urlencoded({ extended : true}));

const validateToken = require("../middleware/validateTokenHandler")

const user_controller = require("../controller/controller")

user_route.post('/register',user_controller.register_user);

user_route.post('/login', user_controller.user_login);

user_route.get('/current', validateToken , user_controller.current_User);

//update password
user_route.post('/update-password', validateToken , user_controller.update_password);

//forget password
user_route.post('/forget-password',   user_controller.forget_password);

//reset password
user_route.get('/reset-password', user_controller.reset_password);

//refresh-token
user_route.post('/refresh-token', validateToken , user_controller.refresh_token);

user_route.get('/dashboard',validateToken, user_controller.dashboard);

user_route.get('/posts/nearby', validateToken,  user_controller.location);

//crud operation

user_route.post('/posts', validateToken, user_controller.createPost);
user_route.get('/posts', validateToken, user_controller.readPost);
user_route.put('/posts/:id', validateToken, user_controller.updatePost);
user_route.delete('/posts/:id', validateToken, user_controller.deletePost);

module.exports = user_route;
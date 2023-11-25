const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const config = require("../config/config");

/*
const validateToken = asyncHandler(async(req,res,next) => {
    const token = req.body.token || req.query.token || req.headers["authentication"];
if(!token){
    res.status(200).send({ success :false,msg:"A token is required for authentication"});
}
try {
    const descode = jwt.verify(token,config.secret_jwt);
    req.user = descode;
} catch (error) {
    res.status(400).send("Invalid token");
}
return next();
*/


const validateToken = asyncHandler(async(req,res,next) => {
let token;
let authHeader = req.headers.Authorization || req.headers.authorization; 
if(authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, config.secret_jwt, (err,decoded) => {
        if (err) { 
            res.status(401).send("User is not authorized");
           // throw new Error("User is not authorized");
        }
        //console.log(decoded);
          req.user = decoded.user;
             next();
    });

    if(!token){
        res.status(401).send("User is not authorized or token is missing");
        // throw new Error("User is not authorized or token is missing");        
    }
}
});

module.exports = validateToken;

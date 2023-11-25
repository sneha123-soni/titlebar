const bcrypt = require("bcrypt");
const User = require("../model/model")

const config = require("../config/config")
const jwt = require("jsonwebtoken");

const create_token = async(id) => {
    try {
       jwt.sign({ _id : id }, config.secret_jwt);
       return token; 

    } catch (error) {
        res.status(400).send(error);
    }
}

const securePassword = async(password) => {
    try {
       const passwordHash = await bcrypt.hash(password,10);
       return passwordHash;
    } catch (error) {
         res.status(400).send(error.message);
    }
}

const register_user = async(req, res) => {
    try {
        const spassword = await securePassword(req.body.password);

       const user = new User({

            name: req.body.name,
            email: req.body.email,
            password : spassword,
    
        });

       const userData = await User.findOne({ email : req.body.email });
       if(userData){
                res.status(400).send({ success :false , msg : "This email is already exists"});

       } else {
        const user_data = await user.save()
        res.status(200).send({ success :true , data : user_data})
       }
        
    } catch (error) {
        res.status(400).send(error.message);
    }
}

 //login method
const user_login = async(req, res) => {
      
    const { email,password } = req.body;
      if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory!")
      }
      const userData = await User.findOne({ email })
      if(userData && (await bcrypt.compare(password, userData.password))){
         const tokenData = jwt.sign({
          //const td = ({
            user: {
             _id : userData._id,
            name : userData.name,
            email : userData.email,
            password:userData.password,
            image: userData.image,
            mobile : userData.mobile,
            type : userData.type,
         //   token : tokenData
            }, 
         }, config.secret_jwt,
         {expiresIn: "24h" }
         );  const response = {
                       success: true,
                       msg: "User Details",
                       token: tokenData, userData
                   }
         res.status(200).json({ response });
      } else{
        res.status(401).send({ success:false , msg:"email or password is not valid" })
        //throw new Error("email or password is not valid")
      }
    }

//optional to perform  so using in postman /current
 const current_User = async (req,res) => {
          //res.json({message: "Current user information"});
       res.json(req.user);
 }

 //update password method
 const update_password = async(req,res) => {
     try {
       const user_id = req.body.user_id;
       const password = req.body.password;

       const data = await User.findOne({ _id:user_id });
       if(data){
        const newPassword =  await securePassword(password);
       const ud = await User.findByIdAndUpdate({ _id:user_id},{ $set:{ password: newPassword }});
      // res.json({message: "update user information"});
             res.status(200).send({ success: true, msg: "your password hasbeen updated"});
         }   
       else{
        //res.json({message: "updated2 user information"});
          res.status(400).send({ success:false, msg:"User id not found!"});
       }
     } catch (error) {
      //res.json({message: "3 information"});
       res.status(400).send(error.message);
     }
 }

 //forget password
 const forget_password = async(req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email:email });

   if(userData){
     const randomString = randomstring.generate();
     User.updateOne({ email:email}, {$set:{token:randomString}});
     sendresetPasswordMail(userData.name,userData.email,randomString);
     res.status(200).send({ success: true, msg:"Please check your inbox of mail and reset your password."});

   }else{
    res.status(400).send({ success: false, msg:"this email doesn't exists"});
   }
  } catch (error) {
    res.status(400).send({ success : false, msg:error.message });
  }
 }

//reset password
const reset_password = async(req,res) => {
  try {
    const token = req.body.token;
    const tokenData = await User.findOne({ token:token });
    if(tokenData){
            const password = req.body.password;
            const newPassword = await securePassword(password);
            const userdata = await User.findByIdAndUpdate({ _id:tokenData._id },{$set: {password:newPassword , token:''}}, {new:true});

            res.status(200).send({ success: true,msg:"User password has been reset", data:userdata })
    } else{
      res.status(400).send({ success:true, msg:"this link has been expired"})
    }
  } catch (error) {
    res.status(400).send({ success: false, msg:error.message});
  }
}

//renew token
const renew_token = async(id) => {
  try {

    const secret_jwt = config.secret_jwt;
    const newSecretJwt = randomstring.generate();
    
    fs.readFile('config/config.js','utf-8',function(err,data){
      if(err) throw err;

     var newValue = data.replace(new RegExp(secret_jwt,"g"),newSecretJwt);
     fs.writeFile('config/config.js', newValue,'utf-8',function(err, data){
      if(err) throw err;
      console.log('Done!');
     });

    });

     const token = await jwt.sign({ _id:id }, newSecretJwt);
         return token;

  } catch (error) {
    res.status(400).send({ success:false, msg:error.message});
  }
}

//refresh controller
const refresh_token = async(req,res) => {
 try {
  const user_id = req.body.user_id;
 const userData = await User.findById({ _id:user_id })
 
 if(userData){
 const tokenData = await renew_token(user_id);
const response = {
  user_id:user_id,
  token:tokenData
}
   res.status(200).send({ success:true, msg:"Refresh Token details",data:response});
 } else{
  res.status(400).send({ success:false, msg:"User not found"});
 }

} catch (error) {
  res.status(400).send({ success:false,msg:error.message})
 }
}

const dashboard = async (req, res) => {
    try {
      const activeCount = await Post.countDocuments({ active: true, createdBy: req.user.id });
      const inactiveCount = await Post.countDocuments({ active: false, createdBy: req.user.id });
  
      res.json({ activeCount, inactiveCount });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
    
// API to retrieve nearby posts
const location =async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      
      const posts = await Post.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: 10000, // 10 kilometers
          },
        },
      });
  
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// CRUD operations for posts

// Create a new post
 const createPost = async (req, res) => {
    try {
      const { title, body, latitude, longitude } = req.body;
  
      const newPost = new Post({
        title,
        body,
        createdBy: req.user.id,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      });
  
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Get all posts for the authenticated user
  const readPost = async (req, res) => {
    try {
      const posts = await Post.find({ createdBy: req.user.id });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Update a post
  const updatePost = async (req, res) => {
    try {
      const { title, body, latitude, longitude } = req.body;
  
      const updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.id },
        {
          $set: {
            title,
            body,
            location: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
          },
        },
        { new: true }
      );
  
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found or you do not have permission' });
      }
  
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Delete a post
  const deletePost = async (req, res) => {
    try {
      const deletedPost = await Post.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  
      if (!deletedPost) {
        return res.status(404).json({ error: 'Post not found or you do not have permission' });
      }
  
      res.json(deletedPost);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
module.exports= { register_user, user_login , current_User, 
                 update_password , forget_password , reset_password,
                 refresh_token, dashboard, location,
                 createPost, readPost, updatePost, deletePost,
                }







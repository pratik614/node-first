import express from "express";                      // installing express for api 
import path from "path";                            //to access static folder public
import mongoose from "mongoose";                    //to connect mongodb database
import cookieParser from "cookie-parser";           // to get access to cookie data
import jwt from "jsonwebtoken";                     // // to get cookie information in readble way
import bcrypt from "bcrypt";                    //to hide password in batabase 





mongoose.connect("mongodb://localhost:27017",{          // to connect compass , compass link
    dbName: "User"})                                       // database name in compass  user is model 
.then(()=>console.log("database is connected")).catch((e)=>console.log(e));    //for error detection

const messageSchema = new mongoose.Schema({               //schemaa for batabase , input field name and email , passed as string
        name :  String,
        email : String,
        password: String,
    });
const User = mongoose.model("User", messageSchema);     // user is model which is based on schema by which db operation can be performed

const app =express();                                   //creating server

app.set("view engine", "ejs");                          // accessing ejs from views folder

app.use(express.static(path.join(path.resolve(),"public")));        // connecting static folder in public -middleware
app.use(express.urlencoded({extended:true}));                       // accessing form data    - middleware
app.use(cookieParser());                                            // accessing cookie data -middleware

const isAuthenticated = async(req,res,next)=>{                       //function for login logout check , if cookie exist as token then shows logout
    const {token}=req.cookies;                                        //cookie passed as token
    if(token){                                                  //if else statement for login logout
      const decoded =  jwt.verify(token,"asdjheuhdajas");    //cookie decoded 
     req.user = await User.findById(decoded._id);           // 
        next();
    }
    else{
        res.redirect("/login");
    }
    

}

app.get("/",isAuthenticated,(req,res)=>{
    
    res.render("logout", {name:req.user.name});
});

app.get("/register",(req,res)=>{
res.render("register");
});

app.post("/register",async(req,res)=>{
    const {name,email,password}= req.body;
     
    let user = await User.findOne({email});
      if(!user){
          const hashedPassword = await bcrypt.hash(password,10);
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            
         });
         const token = jwt.sign({_id:user._id},"asdjheuhdajas");
        
          res.cookie("token", token ,{
            httpOnly: true , expires: new Date(Date.now()+ 60*1000),
          });
          return res.redirect("/");
      }
     else{
     
    res.redirect("/logout");
     }
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
     expires: new Date(Date.now()),
    });

    res.redirect("/");
});
app.get("/login",(req,res)=>{
res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
  
    if (!user) {
      return res.redirect("/register");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { email, message: "Incorrect password" });
    }
  
    const token = jwt.sign({ _id: user._id }, "asdjheuhdajas");
  
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    return res.redirect("/");
  });

app.listen(2500,()=>{
    console.log("server is created");
});
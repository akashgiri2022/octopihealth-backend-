import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import bcrypt from "bcrypt"


const app=express();
const PORT=4000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());

 
//mongo connect

mongoose.connect("mongodb://localhost:27017/", {
    dbName: "userexercise",
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Error");
  });

  //scema

  const user = new mongoose.Schema({
    Email: String,
    Password: String,
    Exercise:String
  });

  //model

  const users = mongoose.model("message", user);



    app.post("/",async(req,res)=>{
  const{password,email}=req.body;
    const userfromDB = await users.findOne({Email:email});
    if(userfromDB){
      if(await bcrypt.compare(password,userfromDB.Password)){
        const token = jwt.sign(
          { _id: userfromDB._id },
          "qwertyhjdggdjsgjfdfdf"
        );
    
        res.cookie("token", token, {
          httpOnly: false,
          expires: new Date(Date.now() + 600 * 1000),
        });

        res.status(200).send({a:"wow"});
      }
      else{
        res.status(203).send({a:"wow"});
      }
    }else{
      console.log(req.body);
      res.status(400).send({a:"wow"});
      
    }
   
    })
   
    app.post("/Signup", async (req, res) => {
      try {
        const { email, password } = req.body;
        const isUser = await users.findOne({ Email:email });
    
        if (isUser) {
          return res.status(400).send("User already registered");
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newuser = new users({ Email:email, Password: hashedPassword });
          const response = await newuser.save();
          const token = jwt.sign(
            { _id: response._id },
            "qwertyhjdggdjsgjfdfdf"
          );
      
          res.cookie("token", token, {
            httpOnly: false,
            expires: new Date(Date.now() + 600 * 1000),
          });
          res.status(201).send(response);
        }
      } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).send({ error: "Something went wrong" });
      }
    });


    app.post("/exercise",async (req,res)=>{
      // console.log(req.body);
      // console.log(req.cookies);
      const {token} = req.cookies;
      const decodeToken = jwt.verify(token, "qwertyhjdggdjsgjfdfdf");

      const curruserdata = await users.findOne({_id:decodeToken._id});
      let obj;
      console.log(curruserdata);
      if(!curruserdata.Exercise){
        obj = {Exercise:req.body.name};
      }
      else{
        const existingExerciseString = curruserdata.Exercise;
        const newExerciseString = req.body.name;
        const updatedExerciseString = existingExerciseString +","+ newExerciseString
        obj = {Exercise:updatedExerciseString};   
      }
      // console.log(decodeToken);
      const filter = { _id: decodeToken._id };
      await users.updateOne(filter,obj);
      res.status(200).send({"hi":"hi"});
    })
    

     


    // console.log(req.body);
    // const hashesPassword=bcrypt.hashSync(password,10)
    // const userDataafterinsrt = await users.create({ Email:email, Passw







app.listen(PORT,()=>{
    console.log("server started")
   
})
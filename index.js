const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(express());
app.use(morgan("dev"));
app.use(cors());

// app.use(express.json({limit: "50mb"}));
// app.use(express.urlencoded());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true}));

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to DataBase!!"))
  .catch((err) => console.log(err));

//Schema base de datos
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
  },
  {
    timestamps: true,
  }
);

//
const userModel = mongoose.model("user", userSchema);

//API
app.get("/", (req, res) => {
  res.send(`Server is running on Port ${PORT}`);
});
//Sign up
app.post("/signup", async (req, res) => {
  const {firstName, lastName, email, password} = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const userSave = await newUser.save();
    const token = jwt.sign({_id: userSave._id}, "secret");
    res.cookie("token", token);

    res.json({
      id: userSave._id,
      firstName: userSave.firstName,
      lastName: userSave.lastName,
      email: userSave.email,
      message: "Successfully Sig Up",
    });
  } catch (error) {
    res.json({message: error.message});
  }
});

//API LOGIN
app.post("/login", async (req, res) => {
  console.log(req.body);
  const {email, password} = req.body;
  try {
    const checkEmail = await userModel.findOne({email: email});
    // res.json(checkEmail.password);
    if (!checkEmail) {
      res.json("user and password Wrong !!!");
    }

    const checkpassword = bcrypt.compareSync(password, checkEmail.password);

    if (checkpassword) {
      const dataSend = {
        userEmail: checkEmail.email,
        firstName: checkEmail.firstName,
        lastName: checkEmail.lastName,
      };
      res.status(200).json({
        status: "Login is Successfully",
        data: dataSend,
      });
    } else {
      res.status(401).json({
        status: "Wrong user or password",
        message: "error",
      });
    }
  } catch (error) {
    res.status({message: "error de sistema"});
  }
});

// Production Section
const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", schemaProduct);

// Save product in data
// API
app.post("/uploadProduct", async (req, res) => {
  console.log(req.body);
  const data = await productModel(req.body);
  const dataSave = await data.save();
  console.log(dataSave);
  res.send({message: "upload successfully"});
});

app.get("/product", async (req, res) => {
  const data = await productModel.find({});
  res.send(data);
});

//server is Running
app.listen(PORT, () => console.log("Server is running at port :" + PORT));

const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const generateAccessToken = require("./libs/jwt");

const app = express();
app.use(morgan("dev"));
app.use(cors());
// app.use(bodyParser.json());
app.use(express());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

//mongodb connectionm
// console.log(process.env.MONGODB_URL);
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
  res.send("Server is running..");
});
//Sign up
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const userSave = await newUser.save();
    const token = jwt.sign({ _id: userSave._id }, "secret");
    // res.cookie("token", token);

    res.json({
      id: userSave._id,
      firstName: userSave.firstName,
      lastName: userSave.lastName,
      email: userSave.email,
      token,
      message: "Successfully Sig Up",
    });
    // res.send({ });
    // res.cookie(token);
  } catch (error) {
    res.json({ message: error.message });
  }
});

//API LOGIN
app.post("/login", (req, res) => {
  console.log(req.body);
});

app.listen(PORT, () => console.log("Server is running at port :" + PORT));
